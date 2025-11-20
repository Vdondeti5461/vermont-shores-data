# Database Performance Optimization Guide

## Overview

This guide provides recommended indexes and optimization strategies for the Summit2Shore environmental monitoring databases:
- **CRRELS2S_raw_data_ingestion** - Raw sensor data
- **CRRELS2S_stage_clean_data** - Cleaned and validated data
- **CRRELS2S_stage_qaqc_data** - Quality-controlled data
- **CRRELS2S_seasonal_qaqc_data** - Seasonal aggregated data

## Recommended Indexes for Analytics Performance

To ensure optimal performance when querying time series data, the following indexes are highly recommended for all four tables across all databases:

### 1. Core Environmental Observations Table

**Table: raw_env_core_observations**

```sql
-- Primary composite index for location + time queries
CREATE INDEX idx_core_location_timestamp 
ON raw_env_core_observations (location, timestamp);

-- Index for snow depth queries
CREATE INDEX idx_core_snow_depth 
ON raw_env_core_observations (snow_depth_cm);

-- Index for air temperature queries
CREATE INDEX idx_core_air_temp 
ON raw_env_core_observations (air_temperature_avg_c);

-- Index for quality flag filtering
CREATE INDEX idx_core_quality_flag 
ON raw_env_core_observations (data_quality_flag, timestamp);
```

### 2. Wind Observations Table

**Table: raw_env_wind_observations**

```sql
-- Primary composite index
CREATE INDEX idx_wind_location_timestamp 
ON raw_env_wind_observations (location, timestamp);

-- Index for wind speed queries
CREATE INDEX idx_wind_speed_max 
ON raw_env_wind_observations (wind_speed_max_ms);

-- Index for wind direction analysis
CREATE INDEX idx_wind_direction 
ON raw_env_wind_observations (wind_direction_deg, timestamp);
```

### 3. Snowpack Temperature Profile Table

**Table: raw_env_snowpack_temperature_profile**

```sql
-- Primary composite index
CREATE INDEX idx_snow_temp_location_timestamp 
ON raw_env_snowpack_temperature_profile (location, timestamp);

-- Indexes for commonly queried depths
CREATE INDEX idx_snow_temp_surface 
ON raw_env_snowpack_temperature_profile (snow_temp_0cm_avg, timestamp);

CREATE INDEX idx_snow_temp_50cm 
ON raw_env_snowpack_temperature_profile (snow_temp_50cm_avg, timestamp);

CREATE INDEX idx_snow_temp_100cm 
ON raw_env_snowpack_temperature_profile (snow_temp_100cm_avg, timestamp);
```

### 4. Precipitation Observations Table

**Table: raw_env_precipitation_observations**

```sql
-- Primary composite index
CREATE INDEX idx_precip_location_timestamp 
ON raw_env_precipitation_observations (location, timestamp);

-- Index for precipitation accumulation queries
CREATE INDEX idx_precip_accum 
ON raw_env_precipitation_observations (precip_total_nrt_mm, timestamp);

-- Index for intensity queries
CREATE INDEX idx_precip_intensity 
ON raw_env_precipitation_observations (precip_intensity_rt_mm_min, timestamp);
```

### 2. Attribute-Specific Indexes

For frequently queried attributes (recommended for analytics):

```sql
-- Snow depth queries
CREATE INDEX idx_snow_depth ON table_name (Snow_Depth_SRDD);

-- Air temperature queries
CREATE INDEX idx_air_temp ON table_name (air_temperature_avg_c);

-- Wind speed queries
CREATE INDEX idx_wind_speed ON table_name (wind_speed_max_ms);
```

### 3. Seasonal Data Tables

For each seasonal table (e.g., `cleaned_data_season_2022_2023`, `cleaned_data_season_2023_2024`):

```sql
-- Apply to each seasonal table in CRRELS2S_seasonal_qaqc_data
CREATE INDEX idx_season_location_time ON cleaned_data_season_YYYY_YYYY (
    Location,
    TIMESTAMP
);

-- For raw data tables in CRRELS2S_raw_data_ingestion
CREATE INDEX idx_raw_location_time ON raw_data_table_name (
    Location,
    TIMESTAMP
);

-- For clean data tables in CRRELS2S_stage_clean_data
CREATE INDEX idx_clean_location_time ON clean_data_table_name (
    Location,
    TIMESTAMP
);

-- For QAQC data tables in CRRELS2S_stage_qaqc_data
CREATE INDEX idx_qaqc_location_time ON qaqc_data_table_name (
    Location,
    TIMESTAMP
);
```

### 4. Multi-Database Query Optimization

Since the analytics system queries across multiple databases (raw, clean, qaqc), ensure indexes exist on all versions:

```sql
-- Example for snow_depth attribute across all quality levels
-- Raw data
CREATE INDEX idx_raw_snow_location_time 
ON CRRELS2S_raw_data_ingestion.table_name (Location, TIMESTAMP, Snow_Depth_SRDD);

-- Clean data
CREATE INDEX idx_clean_snow_location_time 
ON CRRELS2S_stage_clean_data.table_name (Location, TIMESTAMP, Snow_Depth_SRDD);

-- QAQC data
CREATE INDEX idx_qaqc_snow_location_time 
ON CRRELS2S_seasonal_qaqc_data.table_name (Location, TIMESTAMP, Snow_Depth_SRDD);
```

## Query Optimization Tips

### 1. Limit Result Sets
Always use LIMIT when fetching data for visualization:
```sql
SELECT * FROM table_name 
WHERE Location = 'SiteA' 
  AND TIMESTAMP BETWEEN '2022-11-01' AND '2023-07-31'
ORDER BY TIMESTAMP
LIMIT 10000;
```

### 2. Use Covering Indexes
For frequently run queries, create covering indexes:
```sql
CREATE INDEX idx_covering_analytics ON table_name (
    Location,
    TIMESTAMP,
    Snow_Depth_SRDD,
    air_temperature_avg_c,
    wind_speed_max_ms
);
```

### 3. Partition Large Tables
For tables with millions of rows, consider partitioning by date:
```sql
ALTER TABLE table_name
PARTITION BY RANGE (YEAR(TIMESTAMP)) (
    PARTITION p2022 VALUES LESS THAN (2023),
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026)
);
```

## Performance Monitoring

### 1. Check Index Usage
```sql
-- Show index usage statistics
SHOW INDEX FROM table_name;

-- Check if indexes are being used
EXPLAIN SELECT * FROM table_name 
WHERE Location = 'SiteA' AND TIMESTAMP > '2022-11-01';
```

### 2. Identify Slow Queries
```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2; -- Log queries taking > 2 seconds

-- Review slow queries
SELECT * FROM mysql.slow_log 
ORDER BY query_time DESC 
LIMIT 10;
```

### 3. Optimize Table Statistics
```sql
-- Update table statistics for better query planning
ANALYZE TABLE table_name;

-- Optimize table structure
OPTIMIZE TABLE table_name;
```

## Frontend Optimization

### 1. Data Sampling
For large date ranges, implement data sampling on the backend:
```javascript
// Sample every Nth point for long time series
const sampleRate = dataPoints > 1000 ? Math.ceil(dataPoints / 1000) : 1;
const sampledData = fullData.filter((_, index) => index % sampleRate === 0);
```

### 2. Pagination
Implement cursor-based pagination for large datasets:
```sql
-- First page
SELECT * FROM table_name 
WHERE Location = 'SiteA'
ORDER BY TIMESTAMP
LIMIT 1000;

-- Next page
SELECT * FROM table_name 
WHERE Location = 'SiteA' 
  AND TIMESTAMP > '2023-01-15 12:00:00'
ORDER BY TIMESTAMP
LIMIT 1000;
```

### 3. Caching Strategy
- Cache location lists (refresh every 30 minutes)
- Cache season metadata (refresh every hour)
- Cache aggregated statistics (refresh every 5 minutes)
- Use conditional requests with ETags for data endpoints

## Database-Specific Recommendations

### For CRRELS2S_raw_data_ingestion
- Index on ingestion timestamp for recent data queries
- Composite index: (Location, TIMESTAMP, sensor_id)

### For CRRELS2S_stage_clean_data
- Same indexes as raw data
- Additional index on data_quality_flag if present

### For CRRELS2S_stage_qaqc_data
- Composite index: (Location, TIMESTAMP, qaqc_flag)
- Index on anomaly detection flags

### For CRRELS2S_seasonal_qaqc_data
- Seasonal boundary indexes (start/end dates)
- Location + Season composite index

## Expected Query Performance Targets

With proper indexing:
- Location list retrieval: < 100ms
- Single location, single season data: < 500ms
- Multi-location, single season: < 1000ms
- Multi-quality level comparison: < 2000ms
- Full season, all locations: < 3000ms

## Implementation Priority

1. **High Priority** (Immediate)
   - Location + TIMESTAMP composite indexes on all seasonal tables
   - TIMESTAMP indexes on all tables

2. **Medium Priority** (Within 1 week)
   - Attribute-specific indexes (snow_depth, air_temperature, wind_speed)
   - Covering indexes for analytics queries

3. **Low Priority** (Future optimization)
   - Table partitioning for very large tables (> 10M rows)
   - Materialized views for common aggregations

## Monitoring Dashboard Queries

Add these indexes for the admin/monitoring dashboards:
```sql
-- For data quality monitoring
CREATE INDEX idx_quality_monitoring ON table_name (
    TIMESTAMP,
    qaqc_flag,
    data_quality_score
);

-- For system health checks
CREATE INDEX idx_health_check ON table_name (
    TIMESTAMP DESC,
    Location
) INCLUDE (COUNT(*));
```

## Contact for Performance Issues

If queries are still slow after implementing these indexes:
1. Check `EXPLAIN` output for the slow query
2. Verify indexes are being used (`SHOW INDEX`)
3. Consider increasing MySQL buffer pool size
4. Review server resources (CPU, RAM, disk I/O)
5. Consider read replicas for analytics workloads
