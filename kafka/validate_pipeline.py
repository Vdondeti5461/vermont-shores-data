"""
Validate Kafka pipeline data in CRRELS2S_raw_data_ingestion on webdb5.uvm.edu.
Checks all 4 tables for PROC location data.
"""

import mysql.connector
from config import DB_CONFIG, RAW_DATABASE

TABLES = [
    'raw_env_core_observations',
    'raw_env_wind_observations',
    'raw_env_precipitation_observations',
    'raw_env_snowpack_temperature_profile_observations',
]

def main():
    conn = mysql.connector.connect(**DB_CONFIG, database=RAW_DATABASE)
    cursor = conn.cursor()
    print(f"Connected to {DB_CONFIG['host']}/{RAW_DATABASE}\n")

    # 1. Record counts and date ranges per table
    print("=" * 70)
    print("1. PROC record counts and date ranges")
    print("=" * 70)
    for table in TABLES:
        cursor.execute(f"""
            SELECT location, COUNT(*) as cnt, MIN(timestamp) as earliest, MAX(timestamp) as latest
            FROM `{table}`
            WHERE location = 'PROC'
            GROUP BY location
        """)
        row = cursor.fetchone()
        if row:
            print(f"\n  {table}:")
            print(f"    Count: {row[1]}")
            print(f"    Earliest: {row[2]}")
            print(f"    Latest:   {row[3]}")
        else:
            print(f"\n  {table}: NO ROWS for PROC")

    # 2. Most recent core observations
    print("\n" + "=" * 70)
    print("2. Most recent core observations (PROC)")
    print("=" * 70)
    cursor.execute("""
        SELECT timestamp, air_temperature_avg_c, relative_humidity_percent
        FROM raw_env_core_observations
        WHERE location = 'PROC'
        ORDER BY timestamp DESC LIMIT 10
    """)
    rows = cursor.fetchall()
    if rows:
        print(f"  {'timestamp':<22} {'air_temp_c':>10} {'rh_%':>8}")
        print(f"  {'-'*22} {'-'*10} {'-'*8}")
        for r in rows:
            print(f"  {str(r[0]):<22} {str(r[1]):>10} {str(r[2]):>8}")
    else:
        print("  No rows found.")

    # 3. Daily record counts since April 1
    print("\n" + "=" * 70)
    print("3. Daily record counts (PROC, core_observations, since April 1)")
    print("=" * 70)
    cursor.execute("""
        SELECT DATE(timestamp) as day, COUNT(*) as records
        FROM raw_env_core_observations
        WHERE location = 'PROC' AND timestamp >= '2026-04-01'
        GROUP BY DATE(timestamp)
        ORDER BY day
    """)
    rows = cursor.fetchall()
    if rows:
        for r in rows:
            print(f"  {r[0]}  {r[1]} records")
    else:
        print("  No rows since April 1.")

    cursor.close()
    conn.close()
    print("\nDone.")

if __name__ == '__main__':
    main()
