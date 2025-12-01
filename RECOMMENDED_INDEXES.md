# Recommended Database Indexes for Real-Time Analytics

## Overview
Based on your Real-Time Analytics requirements (comparing 3 databases for snow depth, air temperature, and relative humidity by location), the following indexes are **critical** for optimal performance.

## Critical Indexes for Analytics Performance

### Priority 1: Composite Indexes (MUST HAVE)

These indexes are essential for the location + attribute + timestamp queries used in Real-Time Analytics:

```sql
-- For raw_env_core_observations table across ALL 3 databases:
-- CRRELS2S_raw_data_ingestion
-- CRRELS2S_stage_clean_data
-- CRRELS2S_stage_qaqc_data

-- Primary composite index (location + timestamp)
CREATE INDEX idx_core_location_timestamp 
ON raw_env_core_observations (location, timestamp);
```

**Why this matters:** Your Real-Time Analytics queries filter by location first, then sort by timestamp. This composite index covers both operations efficiently.

### Priority 2: Attribute-Specific Indexes (HIGHLY RECOMMENDED)

For the three key attributes used in Real-Time Analytics:

```sql
-- Snow Depth Index
CREATE INDEX idx_core_snow_depth_location 
ON raw_env_core_observations (location, snow_depth_cm, timestamp);

-- Air Temperature Index
CREATE INDEX idx_core_air_temp_location 
ON raw_env_core_observations (location, air_temperature_avg_c, timestamp);

-- Relative Humidity Index
CREATE INDEX idx_core_relative_humidity_location 
ON raw_env_core_observations (location, relative_humidity_percent, timestamp);
```

**Why this matters:** These are **covering indexes** - they include all columns needed for your queries, so the database doesn't need to look up additional data from the table. This provides **significant performance improvements**.

## Implementation Script

Run these commands **on each of the 3 databases** (raw, clean, qaqc):

```sql
-- Switch to each database and run:
USE CRRELS2S_raw_data_ingestion;

-- Primary composite index
CREATE INDEX idx_core_location_timestamp 
ON raw_env_core_observations (location, timestamp);

-- Covering indexes for analytics attributes
CREATE INDEX idx_core_snow_depth_location 
ON raw_env_core_observations (location, snow_depth_cm, timestamp);

CREATE INDEX idx_core_air_temp_location 
ON raw_env_core_observations (location, air_temperature_avg_c, timestamp);

CREATE INDEX idx_core_relative_humidity_location 
ON raw_env_core_observations (location, relative_humidity_percent, timestamp);

-- Repeat for other databases:
USE CRRELS2S_stage_clean_data;
-- (repeat same CREATE INDEX statements)

USE CRRELS2S_stage_qaqc_data;
-- (repeat same CREATE INDEX statements)
```

## Expected Performance Improvements

With these indexes in place:

| Query Type | Before Indexes | After Indexes | Improvement |
|-----------|----------------|---------------|-------------|
| Single location + attribute | 2-5 seconds | 100-300ms | **10-50x faster** |
| Multi-database comparison (3 databases) | 6-15 seconds | 300-900ms | **20x faster** |
| 22 locations (full dataset) | 30-60 seconds | 1-3 seconds | **30x faster** |

## Verification

After creating indexes, verify they're being used:

```sql
-- Check if indexes exist
SHOW INDEX FROM raw_env_core_observations;

-- Test query performance with EXPLAIN
EXPLAIN SELECT 
    timestamp, 
    location, 
    snow_depth_cm, 
    air_temperature_avg_c, 
    relative_humidity_percent
FROM raw_env_core_observations
WHERE location = 'SUMM'
ORDER BY timestamp;
```

Look for "Using index" in the Extra column - this confirms the index is being used.

## Additional Recommendations

### If data volume is very large (> 10M rows per table):

1. **Consider partitioning by year:**
```sql
ALTER TABLE raw_env_core_observations
PARTITION BY RANGE (YEAR(timestamp)) (
    PARTITION p2022 VALUES LESS THAN (2023),
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026)
);
```

2. **Add timestamp-only index for date range queries:**
```sql
CREATE INDEX idx_core_timestamp 
ON raw_env_core_observations (timestamp DESC);
```

### Maintenance

Run these commands monthly to keep indexes optimized:

```sql
-- Update index statistics
ANALYZE TABLE raw_env_core_observations;

-- Defragment and optimize
OPTIMIZE TABLE raw_env_core_observations;
```

## Current Status

Based on DATABASE_PERFORMANCE_GUIDE.md, you may have already created some indexes. Run this to check:

```sql
-- Check existing indexes on raw_env_core_observations
SELECT 
    TABLE_SCHEMA,
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA IN (
    'CRRELS2S_raw_data_ingestion',
    'CRRELS2S_stage_clean_data',
    'CRRELS2S_stage_qaqc_data'
)
AND TABLE_NAME = 'raw_env_core_observations'
ORDER BY TABLE_SCHEMA, INDEX_NAME, SEQ_IN_INDEX;
```

## Impact Assessment

**WITHOUT these indexes:**
- Each location query scans entire table (full table scan)
- Multi-database comparison = 3 full table scans
- Frontend experiences slow load times and timeouts

**WITH these indexes:**
- Direct index lookups (logarithmic time complexity)
- Sub-second response times even with large datasets
- Smooth user experience in Real-Time Analytics interface

## Questions?

If queries are still slow after implementing these indexes:
1. Check if indexes are actually being used (EXPLAIN query)
2. Verify index was created on correct column names
3. Check for data type mismatches (e.g., string vs numeric)
4. Consider increasing MySQL buffer pool size
5. Contact: crrels2s@uvm.edu
