"""
Summit2Shore Kafka Consumer
Reads messages from Kafka topics and inserts into MySQL raw_data database.
Handles duplicates via INSERT IGNORE (timestamp + location is unique).

Usage:
    python consumer.py          # Run consumer (listens forever)
    python consumer.py --test   # Process 10 messages and stop (for testing)
"""

import sys
import json
import signal
from datetime import datetime
from kafka import KafkaConsumer
import mysql.connector
from config import KAFKA_BROKER, KAFKA_CONSUMER_GROUP, DB_CONFIG, RAW_DATABASE, TABLE_MAP

# Build reverse map: topic → db_table
TOPIC_TO_TABLE = {}
for dat_name, info in TABLE_MAP.items():
    TOPIC_TO_TABLE[info['topic']] = info['db_table']

# All topics to subscribe to
ALL_TOPICS = list(set(info['topic'] for info in TABLE_MAP.values()))

# Graceful shutdown
running = True
def signal_handler(sig, frame):
    global running
    print("\nShutting down consumer...")
    running = False

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)


def get_db_connection():
    """Create a MySQL connection to the raw_data database."""
    conn = mysql.connector.connect(
        **DB_CONFIG,
        database=RAW_DATABASE,
        autocommit=False,
    )
    return conn


def get_table_columns(cursor, table_name):
    """Get actual column names from the database table."""
    cursor.execute(f"SHOW COLUMNS FROM `{table_name}`")
    return [row[0] for row in cursor.fetchall()]


def insert_record(cursor, table_name, record, valid_columns):
    """
    Insert a single record into the database.
    Checks for existing record with same timestamp+location before inserting
    to prevent duplicates (since tables don't have unique constraints due to
    historical data with different data_quality_flag values).
    """
    filtered = {}
    for col, val in record.items():
        if col in valid_columns:
            filtered[col] = val

    if 'timestamp' not in filtered or 'location' not in filtered:
        return False

    # Check if record already exists
    try:
        cursor.execute(
            f"SELECT COUNT(*) FROM `{table_name}` WHERE `timestamp` = %s AND `location` = %s",
            (filtered['timestamp'], filtered['location'])
        )
        count = cursor.fetchone()[0]
        if count > 0:
            return False  # Already exists, skip
    except mysql.connector.Error:
        pass  # If check fails, try to insert anyway

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
            print(f"  DB Error: {e}")
        return False


def run_consumer(test_mode=False):
    """Main consumer loop."""
    print(f"{'='*60}")
    print(f"Summit2Shore Kafka Consumer")
    print(f"  Broker: {KAFKA_BROKER}")
    print(f"  Topics: {ALL_TOPICS}")
    print(f"  Database: {DB_CONFIG['host']}/{RAW_DATABASE}")
    print(f"  Group: {KAFKA_CONSUMER_GROUP}")
    print(f"{'='*60}\n")

    # Use poll-based consumption (more reliable than iterator with kafka-python-ng)
    consumer = KafkaConsumer(
        *ALL_TOPICS,
        bootstrap_servers=KAFKA_BROKER,
        value_deserializer=lambda m: json.loads(m.decode('utf-8')),
        auto_offset_reset='earliest',
        enable_auto_commit=True,
        group_id=KAFKA_CONSUMER_GROUP,
    )

    conn = get_db_connection()
    cursor = conn.cursor()
    print(f"Connected to MySQL: {DB_CONFIG['host']}/{RAW_DATABASE}\n")

    # Cache valid columns per table
    column_cache = {}
    for topic, db_table in TOPIC_TO_TABLE.items():
        try:
            column_cache[db_table] = get_table_columns(cursor, db_table)
            print(f"  Table {db_table}: {len(column_cache[db_table])} columns")
        except Exception as e:
            print(f"  Warning: Could not read columns for {db_table}: {e}")

    print(f"\nListening for messages...\n")

    batch_count = 0
    inserted_count = 0
    skipped_count = 0
    total_processed = 0
    empty_polls = 0
    max_empty_polls = 3 if test_mode else 0  # In test mode, stop after 3 empty polls

    try:
        while running:
            # Poll for messages (timeout 5 seconds)
            raw_messages = consumer.poll(timeout_ms=5000, max_records=500)

            if not raw_messages:
                empty_polls += 1
                if test_mode and empty_polls >= max_empty_polls:
                    print(f"  No more messages after {empty_polls} polls, stopping...")
                    break
                if not test_mode:
                    # In continuous mode, just keep polling
                    continue
                continue

            empty_polls = 0  # Reset on successful poll

            for topic_partition, messages in raw_messages.items():
                topic = topic_partition.topic
                db_table = TOPIC_TO_TABLE.get(topic)

                if not db_table:
                    print(f"  Unknown topic: {topic}, skipping")
                    continue

                valid_columns = column_cache.get(db_table, [])
                if not valid_columns:
                    print(f"  No column info for {db_table}, skipping")
                    continue

                for message in messages:
                    record = message.value
                    success = insert_record(cursor, db_table, record, valid_columns)
                    if success:
                        inserted_count += 1
                    else:
                        skipped_count += 1

                    batch_count += 1
                    total_processed += 1

            # Commit after each poll batch
            if batch_count > 0:
                conn.commit()
                ts = datetime.now().strftime('%H:%M:%S')
                print(f"  [{ts}] Committed: {inserted_count} inserted, {skipped_count} skipped (total: {total_processed})")
                batch_count = 0
                inserted_count = 0
                skipped_count = 0

    except Exception as e:
        print(f"Consumer error: {e}")
    finally:
        # Commit any remaining records
        if batch_count > 0:
            conn.commit()
            print(f"  Final commit: {inserted_count} inserted, {skipped_count} skipped")

        print(f"\nTotal processed: {total_processed}")
        cursor.close()
        conn.close()
        consumer.close()


if __name__ == '__main__':
    test_mode = '--test' in sys.argv
    run_consumer(test_mode=test_mode)
