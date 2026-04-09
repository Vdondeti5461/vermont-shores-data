"""
Summit2Shore Kafka Pipeline Configuration
All settings for producer, consumer, and column mappings in one place.
"""

# ============================================
# KAFKA
# ============================================
KAFKA_BROKER = 'localhost:9092'
KAFKA_CONSUMER_GROUP = 's2s-db-writer'

# ============================================
# DATA SOURCE (LoggerNet .dat files)
# ============================================
# Root folder where LoggerNet drops .dat files, organized as:
#   DATA_FOLDER/{LOCATION}/{LOCATION}_{table}.dat
DATA_FOLDER = r'R:\S2S_NetworkData\Summit2Shore_MeteorologicalData\Data_'

# How often to scan for new data (seconds)
POLL_INTERVAL = 60  # Check every minute

# File to track last processed timestamp per location/table
STATE_FILE = r'C:\Users\vdondeti\Desktop\Podman_Machine\producer_state.json'

# ============================================
# DATABASE (MySQL on webdb5.uvm.edu)
# ============================================
DB_CONFIG = {
    'host': 'webdb5.uvm.edu',
    'user': 'crrels2s_admin',
    'password': 'y0m5dxldXSLP',
    'port': 3306,
}

# Target database for raw data ingestion
RAW_DATABASE = 'CRRELS2S_raw_data_ingestion'

# ============================================
# TABLE MAPPING
# Maps .dat file table names → Kafka topics → DB table names
# ============================================
TABLE_MAP = {
    # dat_table_name: { topic, db_table, columns }
    'table1': {
        'topic': 's2s.core_observations',
        'db_table': 'raw_env_core_observations',
    },
    'Table1': {
        'topic': 's2s.core_observations',
        'db_table': 'raw_env_core_observations',
    },
    'Wind': {
        'topic': 's2s.wind_observations',
        'db_table': 'raw_env_wind_observations',
    },
    'Precipitation': {
        'topic': 's2s.precipitation',
        'db_table': 'raw_env_precipitation_observations',
    },
    'precipitation': {
        'topic': 's2s.precipitation',
        'db_table': 'raw_env_precipitation_observations',
    },
    'SnowpkTempProfile': {
        'topic': 's2s.snowpack_temp_profile',
        'db_table': 'raw_env_snowpack_temperature_profile_observations',
    },
    'Snowpk_Temp_Profile': {
        'topic': 's2s.snowpack_temp_profile',
        'db_table': 'raw_env_snowpack_temperature_profile_observations',
    },
}

# ============================================
# COLUMN MAPPING
# Maps .dat file column names → database column names
# The producer renames columns before sending to Kafka,
# so the consumer receives data with DB-ready column names.
# ============================================
COLUMN_MAP = {
    # Core observations (table1)
    'TIMESTAMP': 'timestamp',
    'RECORD': None,  # Skip — not stored in DB
    'Batt_volt_Min': 'battery_voltage_min',
    'PTemp': 'panel_temperature_c',
    'AirTC_Avg': 'air_temperature_avg_c',
    'RH': 'relative_humidity_percent',
    'shf': 'soil_heat_flux_w_m2',
    'Soil_Moisture': 'soil_moisture_wfv',
    'Soil_Temperature_C': 'soil_temperature_c',
    'SWE': 'snow_water_equivalent_mm',
    'Ice_Content': 'ice_content_percent',
    'Water_Content': 'water_content_percent',
    'Snowpack_density': 'snowpack_density_kg_m3',
    'SW_in': 'shortwave_radiation_in_w_m2',
    'SW_out': 'shortwave_radiation_out_w_m2',
    'LW_in': 'longwave_radiation_in_w_m2',
    'LW_out': 'longwave_radiation_out_w_m2',
    'Target_Depth': 'target_depth_cm',
    'Qual': 'quality_number',
    'TCDT': 'tcdt',
    'DBTCDT': 'snow_depth_cm',
    'data_quality_flag': 'data_quality_flag',

    # Wind observations
    'WindDir': 'wind_direction_deg',
    'WS_ms_Max': 'wind_speed_max_ms',
    'WS_ms_TMx': 'wind_speed_max_time',
    'WS_ms': 'wind_speed_avg_ms',
    'WS_ms_S_WVT': 'wind_speed_scalar_avg_ms',
    'WindDir_D1_WVT': 'wind_direction_vector_avg_deg',
    'WindDir_SD1_WVT': 'wind_direction_sd_deg',
    'WS_ms_Min': 'wind_speed_min_ms',
    'WS_ms_TMn': 'wind_speed_min_time',

    # Precipitation
    'Intensity_RT': 'precip_intensity_rt_mm_min',
    'Accu_RT_NRT': 'precip_accum_rt_nrt_mm',
    'Accu_NRT': 'precip_accum_nrt_mm',
    'Accu_total_NRT': 'precip_total_nrt_mm',
    'Bucket_RT': 'bucket_precip_rt_mm',
    'Bucket_NRT': 'bucket_precip_nrt_mm',
    'Load_Temp': 'load_temperature_c',
}

# Columns to always skip (metadata/internal)
SKIP_COLUMNS = {'RECORD'}

# ============================================
# LOCATIONS TO PROCESS
# Start with a subset for testing, then expand to all 22
# ============================================
TEST_LOCATIONS = ['PROC', 'RB01', 'SUMM']
ALL_LOCATIONS = [
    'SUMM', 'RB01', 'RB02', 'RB03', 'RB04', 'RB05', 'RB06',
    'RB07', 'RB08', 'RB09', 'RB10', 'RB11', 'RB12',
    'UNDR', 'PROC', 'SR01', 'SR11', 'SR25',
    'JRCL', 'JRFO', 'SPST', 'PTSH'
]

# Set this to TEST_LOCATIONS for initial testing, then ALL_LOCATIONS for production
ACTIVE_LOCATIONS = TEST_LOCATIONS
