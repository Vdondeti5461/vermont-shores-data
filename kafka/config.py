"""
Summit2Shore Kafka Pipeline Configuration
All settings for producer, consumer, and column mappings in one place.

DB Schema validated against CRRELS2S_raw_data_ingestion on 2026-04-13.
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
#   DATA_FOLDER/{LOCATION}/Table1.dat, Wind.dat, Precipitation.dat, Snowpk_Temp_Profile.dat
DATA_FOLDER = r'R:\S2S_NetworkData\Summit2Shore_MeteorologicalData\Data_'

# How often to scan for new data (seconds)
POLL_INTERVAL = 60  # Check every minute

# File to track last processed timestamp per location/table
STATE_FILE = r'C:\Users\vdondeti\Desktop\kafka\producer_state.json'

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
# Handles multiple naming conventions from LoggerNet
# ============================================
TABLE_MAP = {
    'Table1':              { 'topic': 's2s.core_observations',      'db_table': 'raw_env_core_observations' },
    'table1':              { 'topic': 's2s.core_observations',      'db_table': 'raw_env_core_observations' },
    'Wind':                { 'topic': 's2s.wind_observations',      'db_table': 'raw_env_wind_observations' },
    'wind':                { 'topic': 's2s.wind_observations',      'db_table': 'raw_env_wind_observations' },
    'Precipitation':       { 'topic': 's2s.precipitation',          'db_table': 'raw_env_precipitation_observations' },
    'precipitation':       { 'topic': 's2s.precipitation',          'db_table': 'raw_env_precipitation_observations' },
    'Snowpk_Temp_Profile': { 'topic': 's2s.snowpack_temp_profile',  'db_table': 'raw_env_snowpack_temperature_profile_observations' },
    'SnowpkTempProfile':   { 'topic': 's2s.snowpack_temp_profile',  'db_table': 'raw_env_snowpack_temperature_profile_observations' },
}

# ============================================
# COLUMN MAPPING (.dat header → DB column name)
# Validated against DB schema on 2026-04-13
# ============================================
COLUMN_MAP = {
    # ---- Shared across all tables ----
    'TIMESTAMP': 'timestamp',
    'RECORD': None,  # Skip — auto-increment in DB

    # ---- Core observations (Table1.dat) ----
    # .dat header              → DB column (raw_env_core_observations)
    'Batt_volt_Min':            'battery_voltage_min',
    'PTemp':                    'panel_temperature_c',
    'AirTC_Avg':                'air_temperature_avg_c',
    'RH':                       'relative_humidity_percent',
    'shf':                      'soil_heat_flux_w_m2',
    'Soil_Moisture':            'soil_moisture_wfv',
    'Soil_Temperature_C':       'soil_temperature_c',
    'SWE':                      'snow_water_equivalent_mm',
    'Ice_Content':              'ice_content_percent',
    'Water_Content':            'water_content_percent',
    'Snowpack_density':         'snowpack_density_kg_m3',
    'SW_in':                    'shortwave_radiation_in_w_m2',
    'SW_out':                   'shortwave_radiation_out_w_m2',
    'LW_in':                    'longwave_radiation_in_w_m2',
    'LW_out':                   'longwave_radiation_out_w_m2',
    'Target_Depth':             'target_depth_cm',
    'Qual':                     'quality_number',
    'TCDT':                     'tcdt',
    'DBTCDT':                   'snow_depth_cm',
    'data_quality_flag':        'data_quality_flag',

    # ---- Wind observations (Wind.dat) ----
    # .dat header              → DB column (raw_env_wind_observations)
    'WindDir':                  'wind_direction_deg',
    'WS_ms_Max':                'wind_speed_max_ms',
    'WS_ms_TMx':                'wind_speed_max_time',
    'WS_ms':                    'wind_speed_avg_ms',
    'WS_ms_S_WVT':              'wind_speed_scalar_avg_ms',
    'WindDir_D1_WVT':           'wind_direction_vector_avg_deg',
    'WindDir_SD1_WVT':          'wind_direction_sd_deg',
    'WS_ms_Min':                'wind_speed_min_ms',
    'WS_ms_TMn':                'wind_speed_min_time',

    # ---- Precipitation (Precipitation.dat) ----
    # .dat header              → DB column (raw_env_precipitation_observations)
    'Intensity_RT':             'precip_intensity_rt_mm_min',
    'Accu_RT_NRT':              'precip_accum_rt_nrt_mm',
    'Accu_NRT':                 'precip_accum_nrt_mm',
    'Accu_total_NRT':           'precip_total_nrt_mm',
    'Bucket_RT':                'bucket_precip_rt_mm',
    'Bucket_NRT':               'bucket_precip_nrt_mm',
    'Load_Temp':                'load_temperature_c',

    # ---- Snowpack Temperature Profile (Snowpk_Temp_Profile.dat) ----
    # .dat header              → DB column (raw_env_snowpack_temperature_profile_observations)
    'T107_C_0cm_Avg':           'snow_temp_0cm_avg',
    'T107_C_10cm_Avg':          'snow_temp_10cm_avg',
    'T107_C_20cm_Avg':          'snow_temp_20cm_avg',
    'T107_C_30cm_Avg':          'snow_temp_30cm_avg',
    'T107_C_40cm_Avg':          'snow_temp_40cm_avg',
    'T107_C_50cm_Avg':          'snow_temp_50cm_avg',
    'T107_C_60cm_Avg':          'snow_temp_60cm_avg',
    'T107_C_70cm_Avg':          'snow_temp_70cm_avg',
    'T107_C_80cm_Avg':          'snow_temp_80cm_avg',
    'T107_C_90cm_Avg':          'snow_temp_90cm_avg',
    'T107_C_100cm_Avg':         'snow_temp_100cm_avg',
    'T107_C_110cm_Avg':         'snow_temp_110cm_avg',
    'T107_C_120cm_Avg':         'snow_temp_120cm_avg',
    'T107_C_130cm_Avg':         'snow_temp_130cm_avg',
    'T107_C_140cm_Avg':         'snow_temp_140cm_avg',
    'T107_C_150cm_Avg':         'snow_temp_150cm_avg',
    'T107_C_160cm_Avg':         'snow_temp_160cm_avg',
    'T107_C_170cm_Avg':         'snow_temp_170cm_avg',
    'T107_C_180cm_Avg':         'snow_temp_180cm_avg',
    'T107_C_190cm_Avg':         'snow_temp_190cm_avg',
    'T107_C_200cm_Avg':         'snow_temp_200cm_avg',
    'T107_C_210cm_Avg':         'snow_temp_210cm_avg',
    'T107_C_220cm_Avg':         'snow_temp_220cm_avg',
    'T107_C_230cm_Avg':         'snow_temp_230cm_avg',
    'T107_C_240cm_Avg':         'snow_temp_240cm_avg',
    'T107_C_250cm_Avg':         'snow_temp_250cm_avg',
    'T107_C_260cm_Avg':         'snow_temp_260cm_avg',
    'T107_C_270cm_Avg':         'snow_temp_270cm_avg',
    'T107_C_280cm_Avg':         'snow_temp_280cm_avg',
    'T107_C_290cm_Avg':         'snow_temp_290cm_avg',
}

# Columns to always skip (metadata/internal)
SKIP_COLUMNS = {'RECORD'}

# ============================================
# LOCATIONS TO PROCESS
# ============================================
TEST_LOCATIONS = ['PROC']
ALL_LOCATIONS = [
    'SUMM', 'RB01', 'RB02', 'RB03', 'RB04', 'RB05', 'RB06',
    'RB07', 'RB08', 'RB09', 'RB10', 'RB11', 'RB12',
    'UNDR', 'PROC', 'SR01', 'SR11', 'SR25',
    'JRCL', 'JRFO', 'SPST', 'PTSH'
]

# Start with PROC for testing, switch to ALL_LOCATIONS when ready
ACTIVE_LOCATIONS = TEST_LOCATIONS
