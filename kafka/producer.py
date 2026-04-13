"""
Summit2Shore Kafka Producer
Watches for new .dat files from LoggerNet, parses TOA5 format,
and sends rows to Kafka topics with DB-ready column names.

Usage:
    python producer.py              # Run once (scan and send new data)
    python producer.py --watch      # Run continuously (poll every POLL_INTERVAL)
    python producer.py --backfill   # Send ALL data (ignore state, for initial load)
"""

import os
import sys
import json
import time
import csv
from datetime import datetime
from kafka import KafkaProducer
from config import (
    KAFKA_BROKER, DATA_FOLDER, TABLE_MAP, COLUMN_MAP,
    SKIP_COLUMNS, ACTIVE_LOCATIONS, POLL_INTERVAL, STATE_FILE
)


def load_state():
    """Load last processed timestamp per location/table."""
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, 'r') as f:
            return json.load(f)
    return {}


def save_state(state):
    """Save processing state to disk."""
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2)


def parse_dat_file(filepath):
    """
    Parse a Campbell Scientific TOA5 .dat file.
    Returns: (headers, rows) where headers are the column names from line 2,
    and rows are the data rows starting from line 5.
    """
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        lines = f.readlines()

    if len(lines) < 5:
        return [], []

    # Line 1: Station metadata (TOA5 header)
    # Line 2: Column names (TIMESTAMP, RECORD, ...)
    # Line 3: Units
    # Line 4: Aggregation types (Avg, Smp, Min, etc.)
    # Line 5+: Data rows

    # Parse headers from line 2 (remove quotes)
    header_reader = csv.reader([lines[1].strip()])
    headers = next(header_reader)
    headers = [h.strip().strip('"') for h in headers]

    # Parse data rows (line 5 onward)
    rows = []
    data_text = ''.join(lines[4:])
    reader = csv.reader(data_text.strip().splitlines())
    for row in reader:
        if len(row) >= 2:  # Must have at least TIMESTAMP and one value
            cleaned = [v.strip().strip('"') for v in row]
            rows.append(cleaned)

    return headers, rows


def get_table_from_filename(filename):
    """
    Extract table name from .dat filename.
    Handles two formats:
      - Table1.dat, Wind.dat, Precipitation.dat, Snowpk_Temp_Profile.dat
        (location comes from parent folder name)
      - PROC_Table1.dat, RB01_Wind.dat
        (location prefix in filename)
    """
    name = filename.replace('.dat', '').replace('.csv', '')

    # Check if the name itself (without extension) matches a known table
    if name in TABLE_MAP:
        return name
    # Check case-insensitive
    for key in TABLE_MAP:
        if key.lower() == name.lower():
            return key

    # If not a direct match, try splitting on first underscore (PROC_Table1 format)
    parts = name.split('_', 1)
    if len(parts) >= 2:
        table_part = parts[1]
        if table_part in TABLE_MAP:
            return table_part
        for key in TABLE_MAP:
            if key.lower() == table_part.lower():
                return key

    return name  # Return as-is, let the caller handle unknown tables


def map_columns(headers, row, location):
    """
    Map .dat column names to DB column names using COLUMN_MAP.
    Returns a dict with DB-ready column names and values.
    """
    record = {'location': location}

    for i, header in enumerate(headers):
        if i >= len(row):
            break

        # Skip columns we don't need
        if header in SKIP_COLUMNS:
            continue

        # Map column name to DB name
        db_col = COLUMN_MAP.get(header)

        if db_col is None and header not in SKIP_COLUMNS:
            # Column not in map — skip it (don't guess, only insert known columns)
            continue

        if db_col:
            value = row[i]
            # Convert empty/NaN values to None
            if value in ('', 'NAN', 'NaN', 'nan', 'INF', '-INF', '"NAN"'):
                value = None
            else:
                # Try to convert to number
                try:
                    if '.' in value:
                        value = float(value)
                    elif value.isdigit() or (value.startswith('-') and value[1:].isdigit()):
                        value = int(value)
                except (ValueError, AttributeError):
                    pass  # Keep as string (timestamps, etc.)

            record[db_col] = value

    return record


def send_to_kafka(producer, topic, records):
    """Send a batch of records to a Kafka topic."""
    count = 0
    for record in records:
        producer.send(topic, value=record)
        count += 1
    producer.flush()
    return count


def process_location(producer, location, state, backfill=False):
    """Process all .dat files for a single location."""
    location_folder = os.path.join(DATA_FOLDER, location)
    if not os.path.isdir(location_folder):
        return 0

    total_sent = 0
    state_key_prefix = location

    for filename in os.listdir(location_folder):
        if not filename.endswith('.dat'):
            continue

        filepath = os.path.join(location_folder, filename)
        table_name = get_table_from_filename(filename)

        if not table_name or table_name not in TABLE_MAP:
            # Try case variations
            for key in TABLE_MAP:
                if key.lower() == table_name.lower():
                    table_name = key
                    break
            else:
                print(f"  Skipping {filename} — unknown table: {table_name}")
                continue

        topic = TABLE_MAP[table_name]['topic']
        state_key = f"{state_key_prefix}_{table_name}"
        last_ts = state.get(state_key) if not backfill else None

        # Parse the .dat file
        headers, rows = parse_dat_file(filepath)
        if not headers or not rows:
            continue

        # Filter to only new rows (after last processed timestamp)
        new_records = []
        latest_ts = last_ts

        for row in rows:
            ts = row[0] if row else None  # TIMESTAMP is always first column
            if not ts:
                continue

            # Only send rows newer than last processed
            if last_ts and ts <= last_ts:
                continue

            record = map_columns(headers, row, location)
            if record.get('timestamp'):
                new_records.append(record)
                if latest_ts is None or ts > latest_ts:
                    latest_ts = ts

        if new_records:
            sent = send_to_kafka(producer, topic, new_records)
            total_sent += sent
            print(f"  {location}/{table_name}: sent {sent} new records to {topic}")

            # Update state
            if latest_ts:
                state[state_key] = latest_ts

    return total_sent


def run_once(backfill=False):
    """Single scan of all locations."""
    print(f"\n{'='*60}")
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Scanning for new data...")
    print(f"  Locations: {ACTIVE_LOCATIONS}")
    print(f"  Data folder: {DATA_FOLDER}")
    print(f"{'='*60}")

    producer = KafkaProducer(
        bootstrap_servers=KAFKA_BROKER,
        value_serializer=lambda v: json.dumps(v, default=str).encode('utf-8'),
        acks='all',
        retries=3,
    )

    state = load_state() if not backfill else {}
    total = 0

    for location in ACTIVE_LOCATIONS:
        count = process_location(producer, location, state, backfill)
        total += count

    save_state(state)
    producer.close()

    print(f"\nTotal: {total} records sent to Kafka")
    return total


def run_watch():
    """Continuously poll for new data."""
    print(f"Starting file watcher (polling every {POLL_INTERVAL}s)...")
    print(f"Press Ctrl+C to stop\n")

    while True:
        try:
            run_once()
            time.sleep(POLL_INTERVAL)
        except KeyboardInterrupt:
            print("\nStopping watcher...")
            break
        except Exception as e:
            print(f"Error: {e}")
            time.sleep(POLL_INTERVAL)


if __name__ == '__main__':
    if '--watch' in sys.argv:
        run_watch()
    elif '--backfill' in sys.argv:
        run_once(backfill=True)
    else:
        run_once()
