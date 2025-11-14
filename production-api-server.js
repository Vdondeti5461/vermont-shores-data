require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: ['https://www.uvm.edu', 'https://vdondeti.w3.uvm.edu', 'http://localhost:5173', 'https://5d5ff90d-8cee-4075-81bd-555a25d8e14f.sandbox.lovable.dev'],
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
    pool = mysql.createPool({
      host: 'web5.uvm.edu',
      user: process.env.MYSQL_USER || 'crrels2s_admin',
      password: process.env.MYSQL_PASSWORD || 'y0m5dxldXSLP',
      port: Number(process.env.MYSQL_PORT) || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      multipleStatements: false
    });
    
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL server: web5.uvm.edu');
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

// Location metadata with complete information
const LOCATION_METADATA = {
  'RB01': { name: 'Mansfield East Ranch Brook 1', latitude: 44.2619, longitude: -72.8081, elevation: 1200 },
  'RB02': { name: 'Mansfield East Ranch Brook 2', latitude: 44.2625, longitude: -72.8075, elevation: 1180 },
  'RB03': { name: 'Mansfield East Ranch Brook 3', latitude: 44.2631, longitude: -72.8069, elevation: 1160 },
  'RB04': { name: 'Mansfield East Ranch Brook 4', latitude: 44.2637, longitude: -72.8063, elevation: 1140 },
  'RB05': { name: 'Mansfield East Ranch Brook 5', latitude: 44.2643, longitude: -72.8057, elevation: 1120 },
  'RB06': { name: 'Mansfield East Ranch Brook 6', latitude: 44.2649, longitude: -72.8051, elevation: 1100 },
  'RB07': { name: 'Mansfield East Ranch Brook 7', latitude: 44.2655, longitude: -72.8045, elevation: 1080 },
  'RB08': { name: 'Mansfield East Ranch Brook 8', latitude: 44.2661, longitude: -72.8039, elevation: 1060 },
  'RB09': { name: 'Mansfield East Ranch Brook 9', latitude: 44.2667, longitude: -72.8033, elevation: 1040 },
  'RB10': { name: 'Mansfield East Ranch Brook 10', latitude: 44.2673, longitude: -72.8027, elevation: 1020 },
  'RB11': { name: 'Mansfield East Ranch Brook 11', latitude: 44.2679, longitude: -72.8021, elevation: 1000 },
  'RB12': { name: 'Mansfield East FEMC', latitude: 44.2685, longitude: -72.8015, elevation: 980 },
  'SPER': { name: 'Spear Street', latitude: 44.4759, longitude: -73.1959, elevation: 120 },
  'SR01': { name: 'Sleepers R3/Main', latitude: 44.2891, longitude: -72.8211, elevation: 900 },
  'SR11': { name: 'Sleepers W1/R11', latitude: 44.2885, longitude: -72.8205, elevation: 920 },
  'SR25': { name: 'Sleepers R25', latitude: 44.2879, longitude: -72.8199, elevation: 940 },
  'JRCL': { name: 'Jericho clearing', latitude: 44.4919, longitude: -72.9659, elevation: 300 },
  'JRFO': { name: 'Jericho Forest', latitude: 44.4925, longitude: -72.9665, elevation: 320 },
  'PROC': { name: 'Mansfield West Proctor', latitude: 44.2561, longitude: -72.8141, elevation: 1300 },
  'PTSH': { name: 'Potash Brook', latitude: 44.2567, longitude: -72.8147, elevation: 1280 },
  'SUMM': { name: 'Mansfield SUMMIT', latitude: 44.2573, longitude: -72.8153, elevation: 1339 },
  'UNDR': { name: 'Mansfield West SCAN', latitude: 44.2555, longitude: -72.8135, elevation: 1260 }
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

// Get available databases
app.get('/api/databases', async (req, res) => {
  try {
    const databases = Object.entries(DATABASES)
      .filter(([key]) => !key.includes('_')) // Remove case variants (those with uppercase)
      .map(([key, name]) => {
        const metadata = DATABASE_METADATA[key] || {};
        return {
          key,
          name,
          displayName: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: metadata.description || getDatabaseDescription(key),
          category: metadata.category || 'general',
          order: metadata.order || 999
        };
      })
      .sort((a, b) => a.order - b.order);
    
    res.json({ databases });
  } catch (error) {
    console.error('Error fetching databases:', error);
    res.status(500).json({ error: 'Failed to fetch databases' });
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
    }
    // For final_clean_data (CRRELS2S_ProcessedData), show all tables without filtering

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
      
      return {
        name: col.COLUMN_NAME,
        type: col.DATA_TYPE,
        nullable: col.IS_NULLABLE === 'YES',
        default: col.COLUMN_DEFAULT,
        comment: attrMetadata.description || col.COLUMN_COMMENT || '',
        category: attrMetadata.category || getAttributeCategory(col.COLUMN_NAME),
        isPrimary: ['TIMESTAMP', 'Location'].includes(col.COLUMN_NAME),
        unit: attrMetadata.unit || 'No_Unit',
        measurementType: attrMetadata.measurement_type || 'smp'
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

// Get distinct locations for a specific table with enhanced debugging
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
    const query = `SELECT DISTINCT \`${locCol}\` AS name FROM \`${table}\` 
                   WHERE \`${locCol}\` IS NOT NULL AND \`${locCol}\` <> '' 
                   ORDER BY \`${locCol}\``;
    console.log(`🔍 [SQL QUERY] Executing:`, query);
    
    const [rows] = await connection.execute(query);
    console.log(`📊 [QUERY RESULT] Found ${rows.length} locations:`, rows.map(r => r.name));

    connection.release();
    console.log(`✅ [LOCATIONS ENDPOINT] Success - returning ${rows.length} locations`);

    // Return array of strings (matches UI expectation)
    const result = rows.map(r => r.name);
    res.json(result);
    
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
    // Use actual location metadata with proper coordinates
    const locationsWithCoords = rows.map((loc, index) => {
      const metadata = LOCATION_METADATA[loc.name];
      return {
        id: index + 1,
        name: loc.name,
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
