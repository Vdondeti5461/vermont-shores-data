# Recommended Database Indexes for Real-Time Analytics

## Overview

This document outlines the indexing strategy for optimal performance in the Summit2Shore Real-Time Analytics platform. The analytics system now uses the unified **CRRELS2S_Analytics** database for raw/clean data and the **CRRELS2S_stage_qaqc_data** database for QAQC data.

## Database Architecture

### Analytics Database (CRRELS2S_Analytics)
- **raw_env_combined_observations** - Combined raw sensor data (core + wind + precipitation)
- **clean_env_combined_observations** - Combined cleaned data

### QAQC Database (CRRELS2S_stage_qaqc_data)
- **core_env_observations_qaqc** - QAQC-validated core observations

## Critical Indexes for Analytics Performance

### 1. CRRELS2S_Analytics Database - RAW Table

```sql
USE CRRELS2S_Analytics;

-- Primary composite index (location + timestamp)
CREATE INDEX idx_raw_location_timestamp 
ON raw_env_combined_observations (location, timestamp);

-- Snow Metrics Indexes (covering indexes for performance)
CREATE INDEX idx_raw_loc_ts_snowdepth 
ON raw_env_combined_observations (location, timestamp, snow_depth_cm);

CREATE INDEX idx_raw_loc_ts_swe 
ON raw_env_combined_observations (location, timestamp, snow_water_equivalent_mm);

CREATE INDEX idx_raw_loc_ts_density 
ON raw_env_combined_observations (location, timestamp, snowpack_density_kg_m3);

CREATE INDEX idx_raw_loc_ts_ice 
ON raw_env_combined_observations (location, timestamp, ice_content_percent);

CREATE INDEX idx_raw_loc_ts_water 
ON raw_env_combined_observations (location, timestamp, water_content_percent);

-- Wind Speed Index
CREATE INDEX idx_raw_loc_ts_wind 
ON raw_env_combined_observations (location, timestamp, wind_speed_avg_ms);

-- Precipitation Index
CREATE INDEX idx_raw_loc_ts_precip 
ON raw_env_combined_observations (location, timestamp, precip_intensity_rt_mm_min);

-- Air Temperature Index
CREATE INDEX idx_raw_loc_ts_airtemp 
ON raw_env_combined_observations (location, timestamp, air_temperature_avg_c);

-- Relative Humidity Index
CREATE INDEX idx_raw_loc_ts_rh 
ON raw_env_combined_observations (location, timestamp, relative_humidity_percent);
```

### 2. CRRELS2S_Analytics Database - CLEAN Table

```sql
USE CRRELS2S_Analytics;

-- Primary composite index (location + timestamp)
CREATE INDEX idx_clean_location_timestamp 
ON clean_env_combined_observations (location, timestamp);

-- Snow Metrics Indexes
CREATE INDEX idx_clean_loc_ts_snowdepth 
ON clean_env_combined_observations (location, timestamp, snow_depth_cm);

CREATE INDEX idx_clean_loc_ts_swe 
ON clean_env_combined_observations (location, timestamp, snow_water_equivalent_mm);

CREATE INDEX idx_clean_loc_ts_density 
ON clean_env_combined_observations (location, timestamp, snowpack_density_kg_m3);

CREATE INDEX idx_clean_loc_ts_ice 
ON clean_env_combined_observations (location, timestamp, ice_content_percent);

CREATE INDEX idx_clean_loc_ts_water 
ON clean_env_combined_observations (location, timestamp, water_content_percent);

-- Wind Speed Index
CREATE INDEX idx_clean_loc_ts_wind 
ON clean_env_combined_observations (location, timestamp, wind_speed_avg_ms);

-- Precipitation Index
CREATE INDEX idx_clean_loc_ts_precip 
ON clean_env_combined_observations (location, timestamp, precip_intensity_rt_mm_min);

-- Air Temperature Index
CREATE INDEX idx_clean_loc_ts_airtemp 
ON clean_env_combined_observations (location, timestamp, air_temperature_avg_c);

-- Relative Humidity Index
CREATE INDEX idx_clean_loc_ts_rh 
ON clean_env_combined_observations (location, timestamp, relative_humidity_percent);
```

### 3. CRRELS2S_stage_qaqc_data Database - QAQC Table

```sql
USE CRRELS2S_stage_qaqc_data;

-- Primary composite index (location + timestamp)
CREATE INDEX idx_qaqc_location_timestamp 
ON core_env_observations_qaqc (location, timestamp);

-- Snow Metrics Indexes
CREATE INDEX idx_qaqc_snow_depth_location 
ON core_env_observations_qaqc (location, snow_depth_cm, timestamp);

CREATE INDEX idx_qaqc_swe_location 
ON core_env_observations_qaqc (location, snow_water_equivalent_mm, timestamp);

CREATE INDEX idx_qaqc_density_location 
ON core_env_observations_qaqc (location, snowpack_density_kg_m3, timestamp);

CREATE INDEX idx_qaqc_ice_location 
ON core_env_observations_qaqc (location, ice_content_percent, timestamp);

CREATE INDEX idx_qaqc_water_location 
ON core_env_observations_qaqc (location, water_content_percent, timestamp);

-- Air Temperature Index
CREATE INDEX idx_qaqc_air_temp_location 
ON core_env_observations_qaqc (location, air_temperature_avg_c, timestamp);

-- Relative Humidity Index
CREATE INDEX idx_qaqc_relative_humidity_location 
ON core_env_observations_qaqc (location, relative_humidity_percent, timestamp);
```

## Expected Performance Improvements

| Query Type | Before Indexes | After Indexes | Improvement |
|-----------|----------------|---------------|-------------|
| Single location + attribute | 2-5 seconds | 100-300ms | **10-50x faster** |
| Multi-database comparison (3 databases) | 6-15 seconds | 300-900ms | **20x faster** |
| All Time query (full dataset) | 30-60 seconds | 1-3 seconds | **30x faster** |

## Frontend Service Routing

The frontend analytics service (`realTimeAnalyticsService.ts`) automatically routes queries to the optimal database:

| Request Type | Actual Database | Table |
|-------------|-----------------|-------|
| Raw Data | CRRELS2S_Analytics | raw_env_combined_observations |
| Clean Data | CRRELS2S_Analytics | clean_env_combined_observations |
| QAQC Data | CRRELS2S_stage_qaqc_data | core_env_observations_qaqc |

This transparent routing ensures the UI displays "Raw Data", "Clean Data", and "QAQC Data" labels while the backend uses optimized indexed tables.

## Verification

After creating indexes, verify they're being used:

```sql
-- Check if indexes exist on Analytics database
USE CRRELS2S_Analytics;
SHOW INDEX FROM raw_env_combined_observations;
SHOW INDEX FROM clean_env_combined_observations;

-- Check QAQC indexes
USE CRRELS2S_stage_qaqc_data;
SHOW INDEX FROM core_env_observations_qaqc;

-- Test query performance with EXPLAIN
EXPLAIN SELECT 
    timestamp, 
    location, 
    snow_depth_cm
FROM CRRELS2S_Analytics.raw_env_combined_observations
WHERE location = 'RB01'
ORDER BY timestamp;
```

Look for "Using index" in the Extra column - this confirms the index is being used.

## Maintenance

Run these commands monthly to keep indexes optimized:

```sql
-- Update index statistics
ANALYZE TABLE CRRELS2S_Analytics.raw_env_combined_observations;
ANALYZE TABLE CRRELS2S_Analytics.clean_env_combined_observations;
ANALYZE TABLE CRRELS2S_stage_qaqc_data.core_env_observations_qaqc;

-- Defragment and optimize
OPTIMIZE TABLE CRRELS2S_Analytics.raw_env_combined_observations;
OPTIMIZE TABLE CRRELS2S_Analytics.clean_env_combined_observations;
OPTIMIZE TABLE CRRELS2S_stage_qaqc_data.core_env_observations_qaqc;
```

## Questions?

If queries are still slow after implementing these indexes:
1. Check if indexes are actually being used (EXPLAIN query)
2. Verify index was created on correct column names
3. Check for data type mismatches (e.g., string vs numeric)
4. Consider increasing MySQL buffer pool size
5. Contact: crrels2s@uvm.edu
