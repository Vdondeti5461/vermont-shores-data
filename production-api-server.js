require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: [
    'https://www.uvm.edu',
    'https://crrels2s.w3.uvm.edu',
    'https://vdondeti.w3.uvm.edu',
    'http://localhost:5173'
  ],
  credentials: true
}));

app.use(express.json());

// Enhanced API request logger with comprehensive debugging
app.use('/api', (req, _res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n=== [${timestamp}] API REQUEST ===`);
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.originalUrl}`);
  console.log(`Params:`, req.params);
  console.log(`Query:`, req.query);
  console.log(`Headers:`, {
    'content-type': req.headers['content-type'],
    'user-agent': req.headers['user-agent']?.substring(0, 50) + '...',
    'origin': req.headers.origin
  });
  console.log('=====================================\n');
  next();
});

// Route debugging middleware
app.use('/api/databases/:database/tables/:table/locations', (req, res, next) => {
  console.log('🎯 [LOCATIONS ROUTE MATCHED]', {
    database: req.params.database,
    table: req.params.table,
    timestamp: new Date().toISOString()
  });
  next();
});

// Database connection pool (no specific database - switch per request)
let pool;

async function connectDB() {
  try {
    const dbHost = process.env.MYSQL_HOST || 'webdb5.uvm.edu';
    pool = mysql.createPool({
      host: dbHost,
      user: process.env.MYSQL_USER || 'crrels2s_admin',
      password: process.env.MYSQL_PASSWORD || 'y0m5dxldXSLP',
      port: Number(process.env.MYSQL_PORT) || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      multipleStatements: false
    });
    
    const connection = await pool.getConnection();
    console.log(`✅ Connected to MySQL server: ${dbHost}`);
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

// Known database configurations - support both cases for URL compatibility
const DATABASES = {
  'raw_data': 'CRRELS2S_raw_data_ingestion',
  'Raw_Data': 'CRRELS2S_raw_data_ingestion', // Case variant
  'stage_clean_data': 'CRRELS2S_stage_clean_data', 
  'Stage_Clean_Data': 'CRRELS2S_stage_clean_data', // Case variant
  'stage_qaqc_data': 'CRRELS2S_stage_qaqc_data',
  'Stage_Qaqc_Data': 'CRRELS2S_stage_qaqc_data', // Case variant
  'seasonal_qaqc_data': 'CRRELS2S_seasonal_qaqc_data',
  'Seasonal_Qaqc_Data': 'CRRELS2S_seasonal_qaqc_data' // Case variant
};

// Helper function to get connection with specific database
async function getConnectionWithDB(databaseKey = 'raw_data') {
  const databaseName = DATABASES[databaseKey];
  if (!databaseName) {
    throw new Error(`Unknown database key: ${databaseKey}`);
  }
  
  const connection = await pool.getConnection();
  await connection.query(`USE \`${databaseName}\``);
  return { connection, databaseName };
}

// Helper function to normalize location codes for lookup
function normalizeLocationCode(code) {
  if (!code) return null;
  
  // First try exact match
  if (LOCATION_METADATA[code]) {
    return code;
  }
  
  // Try with dash inserted after 2-4 letter prefix (RB01 -> RB-01, SR01 -> SR-01)
  const withDash = code.replace(/^([A-Z]{2,4})(\d+)$/, '$1-$2');
  if (withDash !== code && LOCATION_METADATA[withDash]) {
    return withDash;
  }
  
  // Try without dash (RB-01 -> RB01)
  const withoutDash = code.replace('-', '');
  if (LOCATION_METADATA[withoutDash]) {
    return withoutDash;
  }
  
  // Return original code if no match found
  return code;
}

// Location metadata with complete information (survey-accurate coordinates)
// Uses standardized location codes matching the database (SR01, SR11, SR25 for Sleepers)
const LOCATION_METADATA = {
  'SUMM': { name: 'Mansfield Summit', latitude: 44.52796261, longitude: -72.81496117, elevation: 1169 },
  'RB01': { name: 'Ranch Brook #1', latitude: 44.52322238, longitude: -72.80863215, elevation: 1075 },
  'RB02': { name: 'Ranch Brook #2', latitude: 44.51775982, longitude: -72.81039188, elevation: 910 },
  'RB12': { name: 'Ranch Brook #12', latitude: 44.51880228, longitude: -72.79785548, elevation: 884 },
  'RB09': { name: 'Ranch Brook #9', latitude: 44.48905, longitude: -72.79285, elevation: 847 },
  'RB03': { name: 'Ranch Brook #3', latitude: 44.51481829, longitude: -72.80905263, elevation: 795 },
  'UNDR': { name: 'Mansfield West SCAN', latitude: 44.53511455, longitude: -72.83462236, elevation: 698 },
  'RB04': { name: 'Ranch Brook #4', latitude: 44.51097861, longitude: -72.80281519, elevation: 640 },
  'RB07': { name: 'Ranch Brook #7', latitude: 44.51528492, longitude: -72.78513705, elevation: 613 },
  'SR01': { name: 'Sleepers R3/Main', latitude: 44.48296257, longitude: -72.16464901, elevation: 553 },
  'RB05': { name: 'Ranch Brook #5', latitude: 44.5044967, longitude: -72.79947434, elevation: 505 },
  'RB08': { name: 'Ranch Brook #8', latitude: 44.50953955, longitude: -72.78220384, elevation: 472 },
  'PROC': { name: 'Mansfield West Proctor', latitude: 44.5285819, longitude: -72.866737, elevation: 418 },
  'RB06': { name: 'Ranch Brook #6', latitude: 44.50370285, longitude: -72.78352521, elevation: 414 },
  'RB11': { name: 'Ranch Brook #11', latitude: 44.50545202, longitude: -72.7713791, elevation: 388 },
  'SR25': { name: 'Sleepers R25', latitude: 44.47682346, longitude: -72.12582909, elevation: 357 },
  'RB10': { name: 'Ranch Brook #10', latitude: 44.49505, longitude: -72.78639, elevation: 624 },
  'SR11': { name: 'Sleepers W1/R11', latitude: 44.45002119, longitude: -72.06714939, elevation: 225 },
  'JRCL': { name: 'Jericho clearing', latitude: 44.447694, longitude: -73.00228357, elevation: 199 },
  'JRFO': { name: 'Jericho forest', latitude: 44.44780437, longitude: -73.00270872, elevation: 196 },
  'SPST': { name: 'Spear St', latitude: 44.45258109, longitude: -73.19181715, elevation: 87 },
  'PTSH': { name: 'Potash Brook', latitude: 44.44489861, longitude: -73.21425398, elevation: 45 }
};

// Table metadata with detailed descriptions
const TABLE_METADATA = {
  'raw_env_core_observations': {
    displayName: 'Core Environmental Observations',
    description: 'Comprehensive environmental measurements including temperature, humidity, soil conditions, radiation, and snow properties',
    attributes: {
      'id': { description: 'Auto-incremented primary key', unit: 'No Unit', measurement_type: 'Identifier', category: 'System' },
      'timestamp': { description: 'Date and time of observation (EST)', unit: 'DateTime', measurement_type: 'No Unit', category: 'Time' },
      'location': { description: 'Logger site ID (e.g., RB01, SUMM)', unit: 'LOC', measurement_type: 'No Unit', category: 'Location' },
      'battery_voltage_min': { description: 'Minimum battery voltage recorded', unit: 'Volts', measurement_type: 'Min', category: 'System' },
      'panel_temperature_c': { description: 'Panel (enclosure) temperature', unit: 'Deg C', measurement_type: 'Sample', category: 'Temperature' },
      'air_temperature_avg_c': { description: 'Air temperature average', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature' },
      'relative_humidity_percent': { description: 'Relative humidity percentage', unit: '%', measurement_type: 'Sample', category: 'Humidity' },
      'soil_heat_flux_w_m2': { description: 'Soil heat flux', unit: 'W/m²', measurement_type: 'Sample', category: 'Radiation' },
      'soil_moisture_wfv': { description: 'Soil moisture in Water-Filled Pore Volume', unit: '%', measurement_type: 'Sample', category: 'Soil' },
      'soil_temperature_c': { description: 'Soil temperature', unit: 'Deg C', measurement_type: 'Sample', category: 'Temperature' },
      'snow_water_equivalent_mm': { description: 'Snow Water Equivalent', unit: 'mm H₂O', measurement_type: 'Sample', category: 'Snow' },
      'ice_content_percent': { description: 'Ice content percentage in the snowpack', unit: '%', measurement_type: 'Sample', category: 'Snow' },
      'water_content_percent': { description: 'Liquid water content percentage in the snowpack', unit: '%', measurement_type: 'Sample', category: 'Snow' },
      'snowpack_density_kg_m3': { description: 'Snowpack density', unit: 'kg/m³', measurement_type: 'Sample', category: 'Snow' },
      'shortwave_radiation_in_w_m2': { description: 'Incoming shortwave radiation', unit: 'W/m²', measurement_type: 'Sample', category: 'Radiation' },
      'shortwave_radiation_out_w_m2': { description: 'Outgoing shortwave radiation', unit: 'W/m²', measurement_type: 'Sample', category: 'Radiation' },
      'longwave_radiation_in_w_m2': { description: 'Incoming longwave radiation', unit: 'W/m²', measurement_type: 'Sample', category: 'Radiation' },
      'longwave_radiation_out_w_m2': { description: 'Outgoing longwave radiation', unit: 'W/m²', measurement_type: 'Sample', category: 'Radiation' },
      'target_depth_cm': { description: 'Target depth of snow/ice sensor', unit: 'cm', measurement_type: 'Sample', category: 'Snow' },
      'tcdt': { description: 'Temp-Corrected Distance from depth sensor', unit: 'cm', measurement_type: 'Sample', category: 'Snow' },
      'snow_depth_cm': { description: 'Calculated snow depth', unit: 'cm', measurement_type: 'Sample', category: 'Snow' },
      'quality_number': { description: 'Quality number (typically 0–600 scale)', unit: 'No Unit', measurement_type: 'Sample', category: 'Quality' },
      'data_quality_flag': { description: 'Data quality flag (0 = raw sample, 1 = median filtered)', unit: 'Flag', measurement_type: 'Flag', category: 'Quality' }
    }
  },
  'raw_env_wind_observations': {
    displayName: 'Wind Observations',
    description: 'Wind speed and direction measurements from meteorological stations',
    attributes: {
      'id': { description: 'Internal auto-increment ID', unit: 'No Unit', measurement_type: 'Identifier', category: 'System' },
      'timestamp': { description: 'Timestamp of wind observation', unit: 'DateTime', measurement_type: 'No Unit', category: 'Time' },
      'location': { description: 'Logger/station ID', unit: 'LOC', measurement_type: 'No Unit', category: 'Location' },
      'wind_direction_deg': { description: 'Instantaneous wind direction', unit: 'degrees', measurement_type: 'Sample', category: 'Wind' },
      'wind_speed_max_ms': { description: 'Maximum wind speed', unit: 'm/s', measurement_type: 'Max', category: 'Wind' },
      'wind_speed_max_time': { description: 'Timestamp of maximum wind speed', unit: 'DateTime', measurement_type: 'Time', category: 'Wind' },
      'wind_speed_avg_ms': { description: 'Instantaneous or average wind speed', unit: 'm/s', measurement_type: 'Avg', category: 'Wind' },
      'wind_speed_scalar_avg_ms': { description: 'Scalar mean wind speed', unit: 'm/s', measurement_type: 'Avg', category: 'Wind' },
      'wind_direction_vector_avg_deg': { description: 'Vector-averaged wind direction', unit: 'degrees', measurement_type: 'Avg', category: 'Wind' },
      'wind_direction_sd_deg': { description: 'Standard deviation of wind direction', unit: 'degrees', measurement_type: 'StdDev', category: 'Wind' },
      'wind_speed_min_ms': { description: 'Minimum wind speed', unit: 'm/s', measurement_type: 'Min', category: 'Wind' },
      'wind_speed_min_time': { description: 'Timestamp of minimum wind speed', unit: 'DateTime', measurement_type: 'Time', category: 'Wind' }
    }
  },
  'raw_env_precipitation_observations': {
    displayName: 'Precipitation Observations',
    description: 'Precipitation measurements including intensity and accumulation',
    attributes: {
      'id': { description: 'Unique row identifier', unit: 'No Unit', measurement_type: 'Identifier', category: 'System' },
      'timestamp': { description: 'Observation time', unit: 'DateTime', measurement_type: 'No Unit', category: 'Time' },
      'location': { description: 'Logger or site identifier', unit: 'LOC', measurement_type: 'No Unit', category: 'Location' },
      'precip_intensity_rt_mm_min': { description: 'Real-time precipitation intensity', unit: 'mm/min', measurement_type: 'Sample', category: 'Precipitation' },
      'precip_accum_rt_nrt_mm': { description: 'Real-time + NRT (near real-time) accumulation', unit: 'mm', measurement_type: 'Accum', category: 'Precipitation' },
      'precip_accum_nrt_mm': { description: 'NRT-only accumulation', unit: 'mm', measurement_type: 'Accum', category: 'Precipitation' },
      'precip_total_nrt_mm': { description: 'Total NRT accumulation', unit: 'mm', measurement_type: 'Total', category: 'Precipitation' },
      'bucket_precip_rt_mm': { description: 'Real-time bucket precipitation measurement', unit: 'mm', measurement_type: 'Sample', category: 'Precipitation' },
      'bucket_precip_nrt_mm': { description: 'NRT bucket precipitation measurement', unit: 'mm', measurement_type: 'Sample', category: 'Precipitation' },
      'load_temperature_c': { description: 'Load sensor temperature', unit: 'Deg C', measurement_type: 'Sample', category: 'Temperature' }
    }
  },
  'raw_env_snowpack_temperature_profile': {
    displayName: 'Snowpack Temperature Profile',
    description: 'Temperature measurements at multiple depths within snowpack from 0cm to 290cm',
    attributes: {
      'id': { description: 'Unique row identifier', unit: 'No Unit', measurement_type: 'Identifier', category: 'System' },
      'timestamp': { description: 'Observation timestamp', unit: 'DateTime', measurement_type: 'No Unit', category: 'Time' },
      'location': { description: 'Logger/site ID', unit: 'LOC', measurement_type: 'No Unit', category: 'Location' },
      'snow_temp_0cm_avg': { description: 'Snow temperature at 0cm depth', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature' },
      'snow_temp_10cm_avg': { description: 'Snow temperature at 10cm depth', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature' },
      'snow_temp_20cm_avg': { description: 'Snow temperature at 20cm depth', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature' },
      'snow_temp_30cm_avg': { description: 'Snow temperature at 30cm depth', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature' },
      'snow_temp_40cm_avg': { description: 'Snow temperature at 40cm depth', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature' },
      'snow_temp_50cm_avg': { description: 'Snow temperature at 50cm depth', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature' },
      'snow_temp_60cm_avg': { description: 'Snow temperature at 60cm depth', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature' },
      'snow_temp_70cm_avg': { description: 'Snow temperature at 70cm depth', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature' },
      'snow_temp_80cm_avg': { description: 'Snow temperature at 80cm depth', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature' },
      'snow_temp_90cm_avg': { description: 'Snow temperature at 90cm depth', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature' },
      'snow_temp_100cm_avg': { description: 'Snow temperature at 100cm depth', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature' },
      'snow_temp_110cm_avg': { description: 'Snow temperature at 110cm depth', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature' },
      'snow_temp_120cm_avg': { description: 'Snow temperature at 120cm depth', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature' },
      'snow_temp_130cm_avg': { description: 'Snow temperature at 130cm depth', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature' },
      'snow_temp_140cm_avg': { description: 'Snow temperature at 140cm depth', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature' },
      'snow_temp_150cm_avg': { description: 'Snow temperature at 150cm depth', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature' },
      'snow_temp_160cm_avg': { description: 'Snow temperature at 160cm depth', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature' },
      'snow_temp_170cm_avg': { description: 'Snow temperature at 170cm depth', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature' },
      'snow_temp_180cm_avg': { description: 'Snow temperature at 180cm depth', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature' },
      'snow_temp_190cm_avg': { description: 'Snow temperature at 190cm depth', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature' },
      'snow_temp_200cm_avg': { description: 'Snow temperature at 200cm depth', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature' },
      'snow_temp_210cm_avg': { description: 'Snow temperature at 210cm depth', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature' },
      'snow_temp_220cm_avg': { description: 'Snow temperature at 220cm depth', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature' },
      'snow_temp_230cm_avg': { description: 'Snow temperature at 230cm depth', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature' },
      'snow_temp_240cm_avg': { description: 'Snow temperature at 240cm depth', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature' },
      'snow_temp_250cm_avg': { description: 'Snow temperature at 250cm depth', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature' },
      'snow_temp_260cm_avg': { description: 'Snow temperature at 260cm depth', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature' },
      'snow_temp_270cm_avg': { description: 'Snow temperature at 270cm depth', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature' },
      'snow_temp_280cm_avg': { description: 'Snow temperature at 280cm depth', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature' },
      'snow_temp_290cm_avg': { description: 'Snow temperature at 290cm depth', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature' }
    }
  }
};


// Database metadata configuration
const DATABASE_METADATA = {
  'raw_data': {
    category: 'raw',
    order: 1,
    description: 'Raw sensor data directly from field loggers, unprocessed'
  },
  'stage_clean_data': {
    category: 'cleaned',
    order: 2,
    description: 'Intermediate cleaned datasets using basic quality control (QC) filters'
  },
  'stage_qaqc_data': {
    category: 'qaqc',
    order: 3,
    description: 'Advanced QAQC with calibration, temporal checks, and derived values'
  },
  'seasonal_qaqc_data': {
    category: 'seasonal',
    order: 4,
    description: 'Seasonal datasets after QAQC is applied, designed for time-bounded analysis'
  }
};

// Helper functions
function getDatabaseDescription(key) {
  return DATABASE_METADATA[key]?.description || 'Environmental monitoring database';
}

function getTableDisplayName(tableName) {
  const displayNames = {
    'table1': 'Primary Environmental Data',
    'Wind': 'Wind Measurements',
    'SnowpkTempProfile': 'Snowpack Temperature Profile',
    'Precipitation': 'Precipitation Data'
  };
  return displayNames[tableName] || tableName.replace(/([A-Z])/g, ' $1').trim();
}

function getTableDescription(tableName) {
  const descriptions = {
    'table1': 'Primary environmental measurements including temperature, humidity, and soil data',
    'Wind': 'Wind speed and direction measurements',
    'SnowpkTempProfile': 'Temperature measurements at various snowpack depths',
    'Precipitation': 'Precipitation intensity and accumulation data'
  };
  return descriptions[tableName] || 'Environmental data measurements';
}

function getAttributeCategory(attributeName) {
  const lowerName = attributeName.toLowerCase();
  if (lowerName.includes('temp') || lowerName.includes('tc')) return 'Temperature';
  if (lowerName.includes('wind') || lowerName.includes('ws')) return 'Wind';
  if (lowerName.includes('precip') || lowerName.includes('rain')) return 'Precipitation';
  if (lowerName.includes('snow') || lowerName.includes('swe')) return 'Snow';
  if (lowerName.includes('soil')) return 'Soil';
  if (lowerName.includes('radiation') || lowerName.includes('sw') || lowerName.includes('lw')) return 'Radiation';
  if (lowerName.includes('humidity') || lowerName.includes('rh')) return 'Humidity';
  if (lowerName === 'timestamp') return 'Time';
  if (lowerName === 'location') return 'Location';
  return 'Other';
}

// Extract unit from attribute name (e.g., "panel_temperature_c" → "°C")
function extractUnitFromAttributeName(attributeName) {
  const lowerName = attributeName.toLowerCase();
  
  // Temperature units
  if (lowerName.endsWith('_c') || lowerName.endsWith('_tc') || lowerName.includes('temperature_c')) return '°C';
  if (lowerName.endsWith('_f') || lowerName.endsWith('_tf') || lowerName.includes('temperature_f')) return '°F';
  if (lowerName.endsWith('_k')) return 'K';
  
  // Percentage
  if (lowerName.includes('percent') || lowerName.endsWith('_pct') || lowerName.includes('humidity_percent')) return '%';
  
  // Distance/Depth
  if (lowerName.endsWith('_mm') || lowerName.includes('_mm_')) return 'mm';
  if (lowerName.endsWith('_cm') || lowerName.includes('_cm_') || lowerName.includes('depth_cm') || lowerName.includes('snow_depth_cm')) return 'cm';
  if (lowerName.endsWith('_m') && !lowerName.includes('_m2') && !lowerName.includes('_m3')) return 'm';
  if (lowerName.endsWith('_km')) return 'km';
  if (lowerName.endsWith('_in')) return 'in';
  
  // Density
  if (lowerName.includes('_kg_m3') || lowerName.includes('density_kg_m3')) return 'kg/m³';
  if (lowerName.includes('_g_cm3')) return 'g/cm³';
  
  // Radiation/Power/Flux
  if (lowerName.includes('_w_m2') || lowerName.includes('radiation_') || lowerName.includes('_flux_')) return 'W/m²';
  if (lowerName.includes('_watt')) return 'W';
  
  // Electrical
  if (lowerName.includes('voltage') || lowerName.endsWith('_v')) return 'Volts';
  if (lowerName.includes('current') || lowerName.endsWith('_a')) return 'Amps';
  
  // Soil moisture
  if (lowerName.includes('wfv') || lowerName.includes('moisture_wfv')) return '%';
  
  // Speed
  if (lowerName.includes('_m_s') || lowerName.includes('_ms') || lowerName.includes('wind_speed')) return 'm/s';
  if (lowerName.includes('_mph')) return 'mph';
  if (lowerName.includes('_km_h')) return 'km/h';
  
  // Pressure
  if (lowerName.includes('_pa') && !lowerName.includes('_kpa') && !lowerName.includes('_hpa')) return 'Pa';
  if (lowerName.includes('_kpa')) return 'kPa';
  if (lowerName.includes('_hpa')) return 'hPa';
  if (lowerName.includes('_mbar')) return 'mbar';
  
  // Time
  if (lowerName.includes('timestamp') || lowerName.includes('datetime') || lowerName === 'date') return 'DateTime';
  if (lowerName.endsWith('_sec') || lowerName.endsWith('_s')) return 's';
  if (lowerName.endsWith('_min')) return 'min';
  if (lowerName.endsWith('_hr') || lowerName.endsWith('_h')) return 'hr';
  
  // Angle/Direction
  if (lowerName.includes('_deg') || lowerName.includes('direction')) return '°';
  
  // Identifiers
  if (lowerName === 'id' || lowerName === 'location' || lowerName === 'site') return 'ID';
  
  return 'No Unit';
}

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release(); 
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

// Get available databases - RESTRICTED to seasonal QAQC only for public download access
app.get('/api/databases', async (req, res) => {
  try {
    // Only return seasonal_qaqc_data database for public download access
    const metadata = DATABASE_METADATA['seasonal_qaqc_data'];
    const databases = [{
      id: DATABASES['seasonal_qaqc_data'],
      key: 'seasonal_qaqc_data',
      name: DATABASES['seasonal_qaqc_data'],
      displayName: 'Seasonal QAQC Data',
      description: metadata.description || 'Quality-controlled seasonal environmental datasets',
      category: metadata.category || 'seasonal',
      order: metadata.order || 4,
      tables: []
    }];

    res.json(databases);
  } catch (error) {
    console.error('Error fetching databases:', error);
    res.status(500).json({ error: 'Failed to fetch databases' });
  }
});

// SEASONAL QAQC SPECIFIC ENDPOINTS

// Get all available seasonal tables (seasons) from seasonal_qaqc_data
app.get('/api/seasonal/tables', async (req, res) => {
  console.log('📅 [SEASONAL TABLES] Fetching available seasons');
  try {
    const { connection, databaseName } = await getConnectionWithDB('seasonal_qaqc_data');
    
    // Get all tables ending with _qaqc
    const [infoRows] = await connection.execute(
      `SELECT TABLE_NAME, TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME LIKE '%_qaqc' 
       ORDER BY TABLE_NAME DESC`,
      [databaseName]
    );

    const tables = infoRows.map(row => {
      const tableName = row.TABLE_NAME;
      // Extract season name from table name (e.g., "season_2023_2024_qaqc" -> "2023-2024")
      const seasonMatch = tableName.match(/season_(\d{4})_(\d{4})_qaqc/);
      const displayName = seasonMatch ? `Season ${seasonMatch[1]}-${seasonMatch[2]}` : tableName;
      
      return {
        id: tableName,
        name: tableName,
        displayName: displayName,
        rowCount: row.TABLE_ROWS || 0,
        description: `Quality-assured and quality-controlled seasonal data for ${displayName}`
      };
    });

    connection.release();
    console.log(`✅ [SEASONAL TABLES] Found ${tables.length} seasons`);
    res.json(tables);
  } catch (error) {
    console.error('❌ [SEASONAL TABLES] Error:', error);
    res.status(500).json({ error: 'Failed to fetch seasonal tables', details: error.message });
  }
});

// Get attributes for a specific seasonal table with unit information
app.get('/api/seasonal/tables/:table/attributes', async (req, res) => {
  const { table } = req.params;
  console.log(`📊 [SEASONAL ATTRIBUTES] Fetching for table: ${table}`);
  
  try {
    const { connection, databaseName } = await getConnectionWithDB('seasonal_qaqc_data');

    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `, [databaseName, table]);

    // Match table to metadata - try to find matching table in TABLE_METADATA
    const tableKey = Object.keys(TABLE_METADATA).find(key => 
      table.toLowerCase().includes(key.toLowerCase().replace('raw_env_', ''))
    );
    const tableMetadata = tableKey ? TABLE_METADATA[tableKey] : null;

    const attributes = columns.map(col => {
      const name = col.COLUMN_NAME;
      const attrMetadata = tableMetadata?.attributes?.[name] || {};
      
      // Try to get unit from metadata first, then extract from attribute name
      const unit = attrMetadata.unit || extractUnitFromAttributeName(name);
      
      return {
        name: name,
        type: col.DATA_TYPE,
        nullable: col.IS_NULLABLE === 'YES',
        description: attrMetadata.description || col.COLUMN_COMMENT || name,
        category: attrMetadata.category || getAttributeCategory(name),
        isPrimary: ['TIMESTAMP', 'timestamp', 'Location', 'location'].includes(name),
        unit: unit,
        measurementType: attrMetadata.measurement_type || 'Sample'
      };
    });

    connection.release();
    console.log(`✅ [SEASONAL ATTRIBUTES] Found ${attributes.length} attributes with unit info`);
    res.json({ table, attributes });
  } catch (error) {
    console.error('❌ [SEASONAL ATTRIBUTES] Error:', error);
    res.status(500).json({ error: 'Failed to fetch table attributes', details: error.message });
  }
});

// Deprecated location codes to filter out (replaced by SR01, SR11, SR25)
const DEPRECATED_LOCATION_CODES = ['SleepersMain_SR01', 'Sleepers_W1', 'Sleepers_R25'];

// Get locations for a specific seasonal table
app.get('/api/seasonal/tables/:table/locations', async (req, res) => {
  const { table } = req.params;
  console.log(`📍 [SEASONAL LOCATIONS] Fetching for table: ${table}`);
  
  try {
    const { connection, databaseName } = await getConnectionWithDB('seasonal_qaqc_data');

    // Case-safe column discovery
    const [cols] = await connection.query(`SHOW COLUMNS FROM \`${table}\``);
    const colMap = new Map(cols.map(c => [c.Field.toLowerCase(), c.Field]));
    const locCol = colMap.get('location') || 'Location';

    const query = `SELECT DISTINCT \`${locCol}\` AS code FROM \`${table}\`
                   WHERE \`${locCol}\` IS NOT NULL AND \`${locCol}\` <> ''
                   ORDER BY \`${locCol}\``;
    
    const [rows] = await connection.execute(query);

    // Enrich with metadata and filter out deprecated location codes
    const locations = rows
      .filter(row => !DEPRECATED_LOCATION_CODES.includes(row.code)) // Exclude old location codes
      .map(row => {
        const code = row.code;
        const normalizedCode = normalizeLocationCode(code);
        const metadata = LOCATION_METADATA[normalizedCode];
        return {
          code: code,
          name: metadata ? metadata.name : code,
          latitude: metadata ? metadata.latitude : null,
          longitude: metadata ? metadata.longitude : null,
          elevation: metadata ? metadata.elevation : null
        };
      });

    connection.release();
    console.log(`✅ [SEASONAL LOCATIONS] Found ${locations.length} locations (filtered out deprecated codes)`);
    res.json(locations);
  } catch (error) {
    console.error('❌ [SEASONAL LOCATIONS] Error:', error);
    res.status(500).json({ error: 'Failed to fetch locations', details: error.message });
  }
});

// Download seasonal data with filters
app.get('/api/seasonal/download/:table', async (req, res) => {
  const { table } = req.params;
  const { locations, start_date, end_date, attributes } = req.query;
  
  console.log(`📥 [SEASONAL DOWNLOAD] Starting download for ${table}`);
  console.log(`   Locations: ${locations || 'all'}`);
  console.log(`   Date range: ${start_date} to ${end_date}`);
  console.log(`   Attributes: ${attributes || 'all'}`);
  
  try {
    const { connection, databaseName } = await getConnectionWithDB('seasonal_qaqc_data');

    // Discover actual column names
    const [colRows] = await connection.query(`SHOW COLUMNS FROM \`${table}\``);
    const allCols = colRows.map(c => c.Field);
    const colMap = new Map(allCols.map(c => [c.toLowerCase(), c]));
    const tsCol = colMap.get('timestamp') || 'TIMESTAMP';
    const locCol = colMap.get('location') || 'Location';

    // Determine selected columns
    let selected;
    if (attributes) {
      const requested = String(attributes).split(',').map(a => a.trim()).filter(Boolean);
      const mapped = requested.map(a => colMap.get(a.toLowerCase()) || a);
      selected = Array.from(new Set([tsCol, locCol, ...mapped])).filter(c => allCols.includes(c));
    } else {
      selected = allCols;
    }

    // Build SELECT with formatted timestamp
    const selectList = selected.map(c => {
      if (c.toLowerCase() === 'timestamp') {
        return `DATE_FORMAT(\`${tsCol}\`, '%Y-%m-%d %H:%i:%s') AS \`TIMESTAMP\``;
      }
      return `\`${c}\``;
    }).join(', ');

    // Build query with filters
    let query = `SELECT ${selectList} FROM \`${table}\` WHERE 1=1`;
    const params = [];

    // Location filter
    if (locations) {
      const locationList = locations.split(',').map(l => l.trim()).filter(Boolean);
      console.log(`📍 [SEASONAL DOWNLOAD] Location filter - received codes:`, locationList);
      if (locationList.length > 0) {
        query += ` AND \`${locCol}\` IN (${locationList.map(() => '?').join(',')})`;
        params.push(...locationList);
      }
    }
    
    // Log the full query for debugging
    console.log(`🔍 [SEASONAL DOWNLOAD] Query: ${query}`);
    console.log(`🔍 [SEASONAL DOWNLOAD] Params:`, params);

    // Date range filters
    if (start_date) {
      query += ` AND \`${tsCol}\` >= ?`;
      params.push(start_date);
    }
    if (end_date) {
      query += ` AND \`${tsCol}\` <= ?`;
      params.push(end_date);
    }

    query += ` ORDER BY \`${tsCol}\` ASC`;

    console.log(`🔍 [SEASONAL DOWNLOAD] Executing query with ${params.length} parameters`);
    const [rows] = await connection.execute(query, params);
    console.log(`📊 [SEASONAL DOWNLOAD] Retrieved ${rows.length} rows`);

    // Set CSV headers
    const filename = `seasonal_qaqc_${table}_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Write CSV with metadata header
    if (rows.length > 0) {
      // Add metadata header rows
      res.write(`# Summit 2 Shore Environmental Data\n`);
      res.write(`# Dataset: ${table}\n`);
      res.write(`# Generated: ${new Date().toISOString()}\n`);
      res.write(`# Date Range: ${start_date || 'All'} to ${end_date || 'All'}\n`);
      if (locations) {
        const locationList = locations.split(',').map(l => l.trim());
        const locationNames = locationList.map(code => {
          const meta = LOCATION_METADATA[code];
          return meta ? `${meta.name} (${code})` : code;
        }).join(', ');
        res.write(`# Locations: ${locationNames}\n`);
      } else {
        res.write(`# Locations: All\n`);
      }
      res.write(`# Total Records: ${rows.length}\n`);
      res.write(`#\n`);
      
      const headers = Object.keys(rows[0]);
      res.write(headers.join(',') + '\n');

      rows.forEach(row => {
        const values = headers.map(h => {
          const v = row[h];
          if (v === null || v === undefined) return '';
          const s = String(v);
          return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
        });
        res.write(values.join(',') + '\n');
      });
    }

    connection.release();
    console.log(`✅ [SEASONAL DOWNLOAD] Download complete`);
    res.end();
  } catch (error) {
    console.error('❌ [SEASONAL DOWNLOAD] Error:', error);
    res.status(500).json({ error: 'Failed to download seasonal data', details: error.message });
  }
});

// Get available tables for a database
app.get('/api/databases/:database/tables', async (req, res) => {
  try {
    const { database } = req.params;
    const { connection, databaseName } = await getConnectionWithDB(database);
    
    // Fetch tables and approximate row counts from information_schema (fast)
    const [infoRows] = await connection.execute(
      `SELECT TABLE_NAME, TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME`,
      [databaseName]
    );

    // Filter season-based tables for specific databases
    let tableNames = infoRows.map((r) => r.TABLE_NAME);
    if (database === 'seasonal_clean_data') {
      // Only filter for seasonal database - it should contain tables starting with 'cleaned_data_season_'
      tableNames = tableNames.filter((t) => t.startsWith('cleaned_data_season_'));
    } else if (database === 'seasonal_qaqc_data') {
      // Only show tables ending with _qaqc for seasonal QAQC database
      tableNames = tableNames.filter((t) => t.endsWith('_qaqc'));
    }
    // For other databases, show all tables without filtering

    // Build table info without running COUNT(*) per table
    const rowCountMap = new Map(infoRows.map((r) => [r.TABLE_NAME, r.TABLE_ROWS ?? 0]));
    const tablesWithInfo = tableNames.map((tableName) => ({
      name: tableName,
      displayName: getTableDisplayName(tableName),
      description: getTableDescription(tableName),
      rowCount: rowCountMap.get(tableName) || 0,
      primaryAttributes: ['TIMESTAMP', 'Location']
    }));
    
    connection.release();
    res.json({ database: databaseName, tables: tablesWithInfo });
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
});

// Get table attributes/columns
app.get('/api/databases/:database/tables/:table/attributes', async (req, res) => {
  try {
    const { database, table } = req.params;
    const { connection, databaseName } = await getConnectionWithDB(database);
    
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `, [databaseName, table]);
    
    const tableKey = table.toLowerCase();
    const tableMetadata = TABLE_METADATA[tableKey];

    const attributes = columns.map(col => {
      const attrMetadata = tableMetadata?.attributes?.[col.COLUMN_NAME] || {};
      
      // Try to get unit from metadata first, then extract from attribute name
      const unit = attrMetadata.unit || extractUnitFromAttributeName(col.COLUMN_NAME);
      
      return {
        name: col.COLUMN_NAME,
        type: col.DATA_TYPE,
        nullable: col.IS_NULLABLE === 'YES',
        default: col.COLUMN_DEFAULT,
        comment: attrMetadata.description || col.COLUMN_COMMENT || '',
        category: attrMetadata.category || getAttributeCategory(col.COLUMN_NAME),
        isPrimary: ['TIMESTAMP', 'Location'].includes(col.COLUMN_NAME),
        unit: unit,
        measurementType: attrMetadata.measurement_type || 'Sample'
      };
    });
    
    connection.release();
    res.json({ 
      database: databaseName, 
      table, 
      attributes,
      primaryAttributes: attributes.filter(attr => attr.isPrimary)
    });
  } catch (error) {
    console.error('Error fetching attributes:', error);
    res.status(500).json({ error: 'Failed to fetch attributes' });
  }
});

// Get distinct locations for a specific table with location name mapping
app.get('/api/databases/:database/tables/:table/locations', async (req, res) => {
  const { database, table } = req.params;
  console.log(`\n🔍 [LOCATIONS ENDPOINT] Starting request for ${database}/${table}`);
  
  try {
    console.log(`📋 [DB CONNECTION] Attempting connection to database: ${database}`);
    const { connection, databaseName } = await getConnectionWithDB(database);
    console.log(`✅ [DB CONNECTION] Connected to: ${databaseName}`);

    // Case-safe column discovery with detailed logging
    console.log(`🔍 [SCHEMA CHECK] Checking columns in table: ${table}`);
    const [cols] = await connection.query(`SHOW COLUMNS FROM \`${table}\``);
    console.log(`📊 [SCHEMA CHECK] Found ${cols.length} columns:`, cols.map(c => c.Field));
    
    const colMap = new Map(cols.map(c => [c.Field.toLowerCase(), c.Field]));
    const locCol = colMap.get('location') || 'Location';
    console.log(`🎯 [LOCATION COLUMN] Using column: ${locCol}`);

    // Query distinct locations with debugging
    const query = `SELECT DISTINCT \`${locCol}\` AS code FROM \`${table}\` 
                   WHERE \`${locCol}\` IS NOT NULL AND \`${locCol}\` <> '' 
                   ORDER BY \`${locCol}\``;
    console.log(`🔍 [SQL QUERY] Executing:`, query);
    
    const [rows] = await connection.execute(query);
    console.log(`📊 [QUERY RESULT] Found ${rows.length} locations:`, rows.map(r => r.code));

    // Enrich with metadata from LOCATION_METADATA using normalized codes
    const locations = rows.map(row => {
      const code = row.code;
      const normalizedCode = normalizeLocationCode(code);
      const metadata = LOCATION_METADATA[normalizedCode];
      return {
        code: code, // Keep original database code for API queries
        name: metadata ? metadata.name : code,
        displayName: metadata ? metadata.name : code,
        latitude: metadata ? metadata.latitude : null,
        longitude: metadata ? metadata.longitude : null,
        elevation: metadata ? metadata.elevation : null
      };
    });

    connection.release();
    console.log(`✅ [LOCATIONS ENDPOINT] Success - returning ${locations.length} mapped locations`);

    res.json(locations);
    
  } catch (error) {
    console.error(`❌ [LOCATIONS ENDPOINT] Error for ${database}/${table}:`, error);
    console.error(`❌ [ERROR STACK]`, error.stack);
    
    res.status(500).json({ 
      error: 'Failed to fetch table locations',
      details: error.message,
      database,
      table,
      timestamp: new Date().toISOString()
    });
  }
});

// Get unique locations from specific database and tables
app.get('/api/databases/:database/locations', async (req, res) => {
  try {
    const { database } = req.params;
    const { tables } = req.query; // comma-separated table names
    const { connection, databaseName } = await getConnectionWithDB(database);
    
    let tableList = [];
    if (tables) {
      tableList = tables.split(',');
    } else {
      // Get all tables if none specified
      const [allTables] = await connection.execute('SHOW TABLES');
      tableList = allTables.map(table => Object.values(table)[0]);
    }
    
    // Simple logic: every table has Location and TIMESTAMP columns
    // Additional filtering for season-based databases  
    if (database === 'seasonal_clean_data') {
      tableList = tableList.filter((t) => t.startsWith('cleaned_data_season_'));
    }

    if (tableList.length === 0) {
      connection.release();
      return res.json([]);
    }

    // Build union query - every table has Location column
    const unionQueries = tableList.map(table =>
      `(SELECT Location as name FROM \`${table}\` WHERE Location IS NOT NULL AND Location != '')`
    );

    // Get all locations, then make them distinct at the end
    const query = `SELECT DISTINCT name FROM (${unionQueries.join(' UNION ALL ')}) AS all_locations ORDER BY name`;

    const [rows] = await connection.execute(query);
    // Use actual location metadata with proper coordinates and normalized codes
    const locationsWithCoords = rows.map((loc, index) => {
      const normalizedCode = normalizeLocationCode(loc.name);
      const metadata = LOCATION_METADATA[normalizedCode];
      return {
        id: index + 1,
        name: loc.name, // Keep original database code
        displayName: metadata ? metadata.name : loc.name,
        latitude: metadata ? metadata.latitude : 44.0 + (index * 0.01),
        longitude: metadata ? metadata.longitude : -72.5 - (index * 0.01),
        elevation: metadata ? metadata.elevation : 1000 + (index * 10)
      };
    });
    
    connection.release();
    res.json(locationsWithCoords);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// Analytics endpoint for JSON time series data (used by Real-Time Analytics page)
app.get('/api/databases/:database/analytics/:table', async (req, res) => {
  try {
    const { database, table } = req.params;
    const { location, start_date, end_date, attributes } = req.query;
    
    console.log(`\n📊 [ANALYTICS] Fetching time series for ${database}/${table}`);
    console.log(`   Location: ${location}`);
    console.log(`   Attributes: ${attributes}`);
    console.log(`   Date range: ${start_date} to ${end_date}`);
    
    const { connection, databaseName } = await getConnectionWithDB(database);

    // Discover actual column names
    const [colRows] = await connection.query(`SHOW COLUMNS FROM \`${table}\``);
    const allCols = colRows.map((c) => c.Field);
    const colMap = new Map(allCols.map((c) => [c.toLowerCase(), c]));
    const tsCol = colMap.get('timestamp') || 'TIMESTAMP';
    const locCol = colMap.get('location') || 'Location';

    // Determine selected columns
    let selected;
    if (attributes) {
      const requested = String(attributes)
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);
      const mapped = requested.map((a) => colMap.get(a.toLowerCase()) || a);
      selected = Array.from(new Set([tsCol, locCol, ...mapped])).filter((c) => allCols.includes(c));
    } else {
      selected = allCols;
    }

    // Build SELECT with formatted timestamp for JSON
    const selectList = selected
      .map((c) => {
        if (c.toLowerCase() === 'timestamp') {
          return `DATE_FORMAT(\`${tsCol}\`, '%Y-%m-%d %H:%i:%s') AS timestamp`;
        }
        return `\`${c}\``;
      })
      .join(', ');

    // Build query with filters
    let query = `SELECT ${selectList} FROM \`${table}\` WHERE 1=1`;
    const params = [];

    // Location filter
    if (location) {
      const locations = location.split(',').map(l => l.trim()).filter(Boolean);
      if (locations.length > 0) {
        const locationPlaceholders = locations.map(() => '?').join(',');
        query += ` AND \`${locCol}\` IN (${locationPlaceholders})`;
        params.push(...locations);
      }
    }

    // Date range filters
    if (start_date) {
      query += ` AND \`${tsCol}\` >= ?`;
      params.push(start_date);
    }

    if (end_date) {
      query += ` AND \`${tsCol}\` <= ?`;
      params.push(end_date);
    }

    query += ` ORDER BY \`${tsCol}\` ASC`;

    console.log(`🔍 [ANALYTICS] Executing query with ${params.length} parameters`);
    const [rows] = await connection.execute(query, params);
    console.log(`✅ [ANALYTICS] Retrieved ${rows.length} rows`);

    connection.release();
    
    // Return JSON format for charting
    res.json(rows);
    
  } catch (error) {
    console.error('❌ [ANALYTICS] Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch analytics data',
      details: error.message,
      database: req.params.database,
      table: req.params.table
    });
  }
});

// Download endpoint for CSV export with proper timestamp formatting
app.get('/api/databases/:database/download/:table', async (req, res) => {
  try {
    const { database, table } = req.params;
    const { location, start_date, end_date, attributes } = req.query;
    const { connection, databaseName } = await getConnectionWithDB(database);

    // Discover actual column names (preserve case) and identify TIMESTAMP/Location columns
    const [colRows] = await connection.query(`SHOW COLUMNS FROM \`${table}\``);
    const allCols = colRows.map((c) => c.Field);
    const colMap = new Map(allCols.map((c) => [c.toLowerCase(), c]));
    const tsCol = colMap.get('timestamp') || 'TIMESTAMP';
    const locCol = colMap.get('location') || 'Location';

    // Determine selected columns
    let selected;
    if (attributes) {
      const requested = String(attributes)
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);
      // Map requested to actual case from DB
      const mapped = requested.map((a) => colMap.get(a.toLowerCase()) || a);
      selected = Array.from(new Set([tsCol, locCol, ...mapped])).filter((c) => allCols.includes(c));
    } else {
      selected = allCols;
    }

    // Build SELECT list with SQL-side TIMESTAMP formatting
    const selectList = selected
      .map((c) => {
        if (c.toLowerCase() === 'timestamp') {
          return `DATE_FORMAT(\`${tsCol}\`, '%Y-%m-%d %H:%i:%s') AS \`TIMESTAMP\``;
        }
        return `\`${c}\``;
      })
      .join(', ');

    // Build query with filters
    let query = `SELECT ${selectList} FROM \`${table}\` WHERE 1=1`;
    const params = [];

    // Handle location filter (multiple locations)
    if (location) {
      const locations = location.split(',').map(l => l.trim()).filter(Boolean);
      if (locations.length > 0) {
        const locationPlaceholders = locations.map(() => '?').join(',');
        query += ` AND \`${locCol}\` IN (${locationPlaceholders})`;
        params.push(...locations);
      }
    }

    if (start_date) {
      query += ` AND \`${tsCol}\` >= ?`;
      params.push(start_date);
    }

    if (end_date) {
      query += ` AND \`${tsCol}\` <= ?`;
      params.push(end_date);
    }

    query += ` ORDER BY \`${tsCol}\` DESC`;

    const [rows] = await connection.execute(query, params);

    // Set headers for CSV download
    const stamp = new Date().toISOString().split('T')[0];
    const filename = `${database}_${table}_${stamp}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Stream CSV rows
    if (rows.length > 0) {
      const headers = Object.keys(rows[0]);
      res.write(headers.join(',') + '\n');

      rows.forEach((row) => {
        const values = headers.map((h) => {
          let v = row[h];
          if (v === null || v === undefined) return '';
          const s = String(v);
          return s.includes(',') ? `"${s}"` : s;
        });
        res.write(values.join(',') + '\n');
      });
    }

    connection.release();
    res.end();
  } catch (error) {
    console.error('Error downloading data:', error);
    res.status(500).json({ error: 'Failed to download data' });
  }
});


// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Database host: web5.uvm.edu`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
