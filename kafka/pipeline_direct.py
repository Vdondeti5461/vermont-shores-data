"""
Summit2Shore Direct Pipeline
Reads LoggerNet .dat files and inserts directly into MySQL.
No Kafka, no Podman, no containers required.

Usage:
    python pipeline_direct.py              # Run once (scan and insert new data)
    python pipeline_direct.py --watch      # Run continuously (poll every 60s)
    python pipeline_direct.py --backfill   # Re-process ALL data (ignore state)

Designed to run via Windows Task Scheduler every 5 minutes,
or continuously with --watch.
"""

import os
import sys
import csv
import json
import time
from datetime import datetime
import mysql.connector
from config import (
    DATA_FOLDER, TABLE_MAP, COLUMN_MAP, SKIP_COLUMNS,
    ACTIVE_LOCATIONS, POLL_INTERVAL, DB_CONFIG, RAW_DATABASE
)

# State file tracks last processed timestamp per location/table
STATE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pipeline_state.json')
LOG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pipeline_direct.log')


def log(msg):
    """Log to console and file."""
    ts = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    line = f"[{ts}] {msg}"
    print(line)
    try:
        with open(LOG_FILE, 'a') as f:
            f.write(line + '\n')
    except Exception:
        pass


def load_state():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, 'r') as f:
            return json.load(f)
    return {}


def save_state(state):
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2)


def parse_dat_file(filepath):
    """Parse a Campbell Scientific TOA5 .dat file."""
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        lines = f.readlines()

    if len(lines) < 5:
        return [], []

    header_reader = csv.reader([lines[1].strip()])
    headers = next(header_reader)
    headers = [h.strip().strip('"') for h in headers]

    rows = []
    data_text = ''.join(lines[4:])
    reader = csv.reader(data_text.strip().splitlines())
    for row in reader:
        if len(row) >= 2:
            cleaned = [v.strip().strip('"') for v in row]
            rows.append(cleaned)

    return headers, rows


def get_table_from_filename(filename):
    """Extract table name from .dat filename."""
    name = filename.replace('.dat', '').replace('.csv', '')

    if name in TABLE_MAP:
        return name
    for key in TABLE_MAP:
        if key.lower() == name.lower():
            return key

    parts = name.split('_', 1)
    if len(parts) >= 2:
        table_part = parts[1]
        if table_part in TABLE_MAP:
            return table_part
        for key in TABLE_MAP:
            if key.lower() == table_part.lower():
                return key

    return name


def map_columns(headers, row, location):
    """Map .dat column names to DB column names."""
    record = {'location': location}

    for i, header in enumerate(headers):
        if i >= len(row):
            break
        if header in SKIP_COLUMNS:
            continue

        db_col = COLUMN_MAP.get(header)
        if db_col is None:
            continue

        if db_col:
            value = row[i]
            if value in ('', 'NAN', 'NaN', 'nan', 'INF', '-INF', '"NAN"'):
                value = None
            else:
                try:
                    if '.' in value:
                        value = float(value)
                    elif value.isdigit() or (value.startswith('-') and value[1:].isdigit()):
                        value = int(value)
                except (ValueError, AttributeError):
                    pass
            record[db_col] = value

    return record


def get_db_connection():
    """Create MySQL connection."""
    return mysql.connector.connect(
        **DB_CONFIG,
        database=RAW_DATABASE,
        autocommit=False,
    )


def get_table_columns(cursor, table_name):
    """Get column names from DB table."""
    cursor.execute(f"SHOW COLUMNS FROM `{table_name}`")
    return [row[0] for row in cursor.fetchall()]


def insert_record(cursor, table_name, record, valid_columns):
    """Insert a single record, skip if duplicate."""
    filtered = {col: val for col, val in record.items() if col in valid_columns}

    if 'timestamp' not in filtered or 'location' not in filtered:
        return False

    # Check for existing record
    try:
        cursor.execute(
            f"SELECT COUNT(*) FROM `{table_name}` WHERE `timestamp` = %s AND `location` = %s",
            (filtered['timestamp'], filtered['location'])
        )
        if cursor.fetchone()[0] > 0:
            return False
    except mysql.connector.Error:
        pass

    columns = list(filtered.keys())
    placeholders = ', '.join(['%s'] * len(columns))
    col_str = ', '.join([f'`{c}`' for c in columns])
    query = f"INSERT INTO `{table_name}` ({col_str}) VALUES ({placeholders})"
    values = [filtered[c] for c in columns]

    try:
        cursor.execute(query, values)
        return cursor.rowcount > 0
    except mysql.connector.Error as e:
        if 'Duplicate' not in str(e):
            log(f"  DB Error: {e}")
        return False


def process_location(cursor, column_cache, location, state, backfill=False):
    """Process all .dat files for a single location, insert directly to DB."""
    location_folder = os.path.join(DATA_FOLDER, location)
    if not os.path.isdir(location_folder):
        return 0, 0

    total_inserted = 0
    total_skipped = 0

    for filename in os.listdir(location_folder):
        if not filename.endswith('.dat'):
            continue

        filepath = os.path.join(location_folder, filename)
        table_name = get_table_from_filename(filename)

        if not table_name or table_name not in TABLE_MAP:
            for key in TABLE_MAP:
                if key.lower() == table_name.lower():
                    table_name = key
                    break
            else:
                continue

        db_table = TABLE_MAP[table_name]['db_table']
        state_key = f"{location}_{table_name}"
        last_ts = state.get(state_key) if not backfill else None

        valid_columns = column_cache.get(db_table, [])
        if not valid_columns:
            continue

        headers, rows = parse_dat_file(filepath)
        if not headers or not rows:
            continue

        # Filter to new rows only
        latest_ts = last_ts
        inserted = 0
        skipped = 0

        for row in rows:
            ts = row[0] if row else None
            if not ts:
                continue
            if last_ts and ts <= last_ts:
                continue

            record = map_columns(headers, row, location)
            if not record.get('timestamp'):
                continue

            success = insert_record(cursor, db_table, record, valid_columns)
            if success:
                inserted += 1
            else:
                skipped += 1

            if latest_ts is None or ts > latest_ts:
                latest_ts = ts

        if inserted > 0:
            log(f"  {location}/{table_name}: {inserted} inserted, {skipped} skipped → {db_table}")

        if latest_ts and latest_ts != last_ts:
            state[state_key] = latest_ts

        total_inserted += inserted
        total_skipped += skipped

    return total_inserted, total_skipped


def run_once(backfill=False):
    """Single scan of all locations → direct to DB."""
    log(f"{'='*60}")
    log(f"Scanning {len(ACTIVE_LOCATIONS)} locations...")
    log(f"  Data folder: {DATA_FOLDER}")
    log(f"  Database: {DB_CONFIG['host']}/{RAW_DATABASE}")
    log(f"{'='*60}")

    conn = get_db_connection()
    cursor = conn.cursor()

    # Cache column info per table
    column_cache = {}
    db_tables = set(info['db_table'] for info in TABLE_MAP.values())
    for db_table in db_tables:
        try:
            column_cache[db_table] = get_table_columns(cursor, db_table)
        except Exception as e:
            log(f"  Warning: Could not read columns for {db_table}: {e}")

    state = load_state() if not backfill else {}
    total_inserted = 0
    total_skipped = 0

    for location in ACTIVE_LOCATIONS:
        inserted, skipped = process_location(cursor, column_cache, location, state, backfill)
        if inserted > 0:
            conn.commit()
        total_inserted += inserted
        total_skipped += skipped

    # Final commit
    conn.commit()
    save_state(state)
    cursor.close()
    conn.close()

    log(f"Done: {total_inserted} inserted, {total_skipped} skipped across {len(ACTIVE_LOCATIONS)} locations")
    return total_inserted


def run_watch():
    """Continuously poll for new data."""
    log(f"Starting continuous pipeline (polling every {POLL_INTERVAL}s)...")
    log(f"Locations: {ACTIVE_LOCATIONS}")
    log(f"Press Ctrl+C to stop\n")

    while True:
        try:
            run_once()
            time.sleep(POLL_INTERVAL)
        except KeyboardInterrupt:
            log("Stopping pipeline...")
            break
        except Exception as e:
            log(f"Error (will retry): {e}")
            time.sleep(POLL_INTERVAL)


if __name__ == '__main__':
    if '--watch' in sys.argv:
        run_watch()
    elif '--backfill' in sys.argv:
        run_once(backfill=True)
    else:
        run_once()
