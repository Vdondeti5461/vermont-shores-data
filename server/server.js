const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

// Import route handlers
const bulkDownloadRoutes = require('./routes/bulkDownload');

require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection pool (no specific database)
let pool;

// Known database configurations - Your original working mapping
const DATABASES = {
  'raw_data': 'CRRELS2S_VTClimateRepository',
  'initial_clean_data': 'CRRELS2S_VTClimateRepository_Processed',
  'final_clean_data': 'CRRELS2S_ProcessedData',
  'seasonal_clean_data': 'CRRELS2S_cleaned_data_seasons'
};

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
  'table1': {
    displayName: 'Primary Environmental Data',
    description: 'Comprehensive environmental measurements including temperature, humidity, soil conditions, and radiation',
    attributes: {
      'TS_LOC_REC': { description: 'TimeStamp Location Record', unit: 'No_Unit', measurement_type: 'Identifier', category: 'System' },
      'TIMESTAMP': { description: 'TimeStamp', unit: 'TS', measurement_type: 'No_Unit', category: 'Time' },
      'LOCATION': { description: 'Location', unit: 'LOC', measurement_type: 'No_Unit', category: 'Location' },
      'Record': { description: 'Record Number', unit: 'RN', measurement_type: 'No Unit', category: 'System' },
      'Batt_Volt_Min': { description: 'Battery Voltage', unit: 'Volts', measurement_type: 'Min', category: 'System' },
      'P_Temp': { description: 'Panel Temperature (Reference Temperature Measurement)', unit: 'Deg C', measurement_type: 'smp', category: 'Temperature' },
      'AirTC_Avg': { description: 'Air Temperature Average in Celcius', unit: 'Deg C', measurement_type: 'Avg', category: 'Temperature' },
      'RH': { description: 'Relative Humidity', unit: '%', measurement_type: 'Smp', category: 'Humidity' },
      'SHF': { description: 'Soil Heat Flux (radiation Parameter)', unit: 'W/m^2', measurement_type: 'smp', category: 'Radiation' },
      'Soil_Moisture': { description: 'Soil Moisture', unit: 'wfv', measurement_type: 'smp', category: 'Soil' },
      'Soil_Temperature_C': { description: 'Soil Temperature in Celcius', unit: 'Deg C', measurement_type: 'smp', category: 'Temperature' },
      'SWE': { description: 'Snow water Equivalent', unit: 'mm of H20', measurement_type: 'smp', category: 'Snow' },
      'Ice_content': { description: 'Ice content of SnowPack', unit: '%', measurement_type: 'smp', category: 'Snow' },
      'Water_Content': { description: 'Water Content of SnowPack', unit: '%', measurement_type: 'smp', category: 'Snow' },
      'Snowpack_Density': { description: 'Snowpack Density', unit: 'kg/m^3', measurement_type: 'smp', category: 'Snow' },
      'SW_in': { description: 'Short wave radiation incoming', unit: 'W/m^2', measurement_type: 'smp', category: 'Radiation' },
      'SW_out': { description: 'Short wave radiation outgoing', unit: 'W/m^2', measurement_type: 'smp', category: 'Radiation' },
      'LW_in': { description: 'Longwave radation incoming', unit: 'W/m^2', measurement_type: 'smp', category: 'Radiation' },
      'LW_out': { description: 'Longwave radiation outgoing', unit: 'W/m^2', measurement_type: 'smp', category: 'Radiation' },
      'Target_Depth': { description: 'Target depth', unit: 'cm', measurement_type: 'smp', category: 'Snow' },
      'Qual': { description: 'Quality numbers (snow sensor)', unit: 'No Unit', measurement_type: 'smp', category: 'Quality' },
      'TCDT': { description: 'Temperature corrected distance value', unit: 'cm', measurement_type: 'smp', category: 'Snow' },
      'DBTCDT': { description: 'Snow Depth', unit: 'cm', measurement_type: 'smp', category: 'Snow' },
      'Target_Depth_Med': { description: 'Target depth - Median Data', unit: 'cm', measurement_type: 'Med', category: 'Snow' },
      'Qual_Med': { description: 'Quality numbers (snow sensor) - Median Data', unit: 'No Unit', measurement_type: 'Med', category: 'Quality' },
      'TCDT_Med': { description: 'Temperature corrected distance value - Median Data', unit: 'cm', measurement_type: 'Med', category: 'Snow' },
      'DBTCDT_Med': { description: 'Snow Depth - Median Data', unit: 'cm', measurement_type: 'Med', category: 'Snow' },
      'DataQualityFlag': { description: 'Data Quality Flag (1=Median Data, 0=Original Data)', unit: 'Flag', measurement_type: 'Flag', category: 'Quality' }
    }
  },
  'Wind': {
    displayName: 'Wind Measurements',
    description: 'Wind speed and direction measurements from meteorological stations',
    attributes: {
      'TIMESTAMP': { description: 'TimeStamp', unit: 'TS', measurement_type: 'No_Unit', category: 'Time' },
      'LOCATION': { description: 'Location', unit: 'LOC', measurement_type: 'No_Unit', category: 'Location' },
      'Record': { description: 'Record Number', unit: 'RN', measurement_type: 'No Unit', category: 'System' },
      'WindDir': { description: 'Wind Direction', unit: 'deg', measurement_type: 'smp', category: 'Wind' },
      'WS_ms_Max': { description: 'Max wind speed', unit: 'meters/second', measurement_type: 'Max', category: 'Wind' },
      'WS_ms_TMx': { description: 'Wind Speed Time of Max', unit: 'meters/second', measurement_type: 'TMx', category: 'Wind' },
      'WS_ms': { description: 'Wind speed', unit: 'meters/second', measurement_type: 'smp', category: 'Wind' },
      'WS_ms_S_WVT': { description: 'Wind Speed Standard Deviation', unit: 'meters/second', measurement_type: 'Wvc', category: 'Wind' },
      'WindDir_D1_WVT': { description: 'Wind Direction Vector', unit: 'Deg', measurement_type: 'Wvc', category: 'Wind' },
      'WindDir_SD1_WVT': { description: 'Wind Direction Standard Deviation', unit: 'Deg', measurement_type: 'Wvc', category: 'Wind' },
      'WS_ms_Min': { description: 'Min wind speed', unit: 'meters/second', measurement_type: 'Min', category: 'Wind' },
      'WS_ms_TMn': { description: 'Wind Speed Time of Min', unit: 'meters/second', measurement_type: 'TMn', category: 'Wind' }
    }
  },
  'Precipitation': {
    displayName: 'Precipitation Data',
    description: 'Precipitation measurements including intensity, accumulation, and bucket data',
    attributes: {
      'TIMESTAMP': { description: 'TimeStamp', unit: 'TS', measurement_type: 'No_Unit', category: 'Time' },
      'LOCATION': { description: 'Location', unit: 'LOC', measurement_type: 'No_Unit', category: 'Location' },
      'Record': { description: 'Record Number', unit: 'RN', measurement_type: 'No Unit', category: 'System' },
      'Intensity_RT': { description: 'Intensity Real time', unit: 'mm/min', measurement_type: 'smp', category: 'Precipitation' },
      'Accu_NRT': { description: 'Accumulated Non real time Precipitation', unit: 'mm', measurement_type: 'smp', category: 'Precipitation' },
      'Accu_RT_NRT': { description: 'Accumulated real time - Non Real time Precipitation', unit: 'mm', measurement_type: 'smp', category: 'Precipitation' },
      'Accu_Total_NRT': { description: 'Accumulated Total Non real time Precipitation', unit: 'mm', measurement_type: 'smp', category: 'Precipitation' },
      'Bucket_NRT': { description: 'Bucket Precipitation Non real time', unit: 'mm', measurement_type: 'smp', category: 'Precipitation' },
      'Bucket_RT': { description: 'Bucket Precipitation real time', unit: 'mm', measurement_type: 'smp', category: 'Precipitation' },
      'Load_Temp': { description: 'Load Temperature (Battery)', unit: 'Deg C', measurement_type: 'smp', category: 'Temperature' }
    }
  },
  'SnowPkTempProfile': {
    displayName: 'Snow Pack Temperature Profile',
    description: 'Snowpack temperature measurements at various depths from 0cm to 290cm',
    attributes: {
      'TIMESTAMP': { description: 'TimeStamp', unit: 'TS', measurement_type: 'No_Unit', category: 'Time' },
      'LOCATION': { description: 'Location', unit: 'LOC', measurement_type: 'No_Unit', category: 'Location' },
      'Record': { description: 'Record Number', unit: 'RN', measurement_type: 'No Unit', category: 'System' }
    }
  }
};

async function connectDB() {
  try {
    // Create pool without specifying database for dynamic switching
    // Add SSL for production webdb5.uvm.edu, keep simple for localhost
    const isProduction = process.env.MYSQL_HOST === 'webdb5.uvm.edu';
    
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      port: process.env.MYSQL_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      multipleStatements: false,
      ssl: isProduction ? { rejectUnauthorized: false } : undefined
    });
    
    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL server:', process.env.MYSQL_HOST);
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

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

// Helper function to format data based on table
function formatTableData(tableName, rows) {
  if (!rows || rows.length === 0) return [];
  
  switch(tableName) {
    case 'table1':
      return rows.map(row => ({
        id: row.TS_LOC_RECORD,
        timestamp: row.TIMESTAMP,
        record: row.RECORD,
        location: row.Location,
        battery_voltage: row.Batt_volt_Min,
        panel_temp: row.PTemp,
        air_temp_avg: row.AirTC_Avg,
        relative_humidity: row.RH,
        soil_heat_flux: row.shf,
        soil_moisture: row.Soil_Moisture,
        soil_temperature: row.Soil_Temperature_C,
        snow_water_equivalent: row.SWE,
        ice_content: row.Ice_Content,
        water_content: row.Water_Content,
        snowpack_density: row.Snowpack_Density,
        shortwave_in: row.SW_in,
        shortwave_out: row.SW_out,
        longwave_in: row.LW_in,
        longwave_out: row.LW_out,
        target_depth: row.Target_Depth,
        quality: row.Qual,
        tcdt: row.TCDT,
        dbtcdt: row.DBTCDT,
        data_quality_flag: row.DataQualityFlag
      }));
      
    case 'Wind':
      return rows.map(row => ({
        timestamp: row.TIMESTAMP,
        record: row.RECORD,
        location: row.Location,
        wind_direction: row.WindDir,
        wind_speed_max: row.WS_ms_Max,
        wind_speed_max_time: row.WS_ms_TMx,
        wind_speed_avg: row.WS_ms,
        wind_speed_vector: row.WS_ms_S_WVT,
        wind_direction_vector: row.WindDir_D1_WVT,
        wind_direction_std: row.WindDir_SD1_WVT,
        wind_speed_min: row.WS_ms_Min,
        wind_speed_min_time: row.WS_ms_TMn
      }));
      
    case 'SnowpkTempProfile':
      return rows.map(row => {
        const tempProfile = {};
        // Extract all temperature measurements at different depths
        for (let depth = 0; depth <= 290; depth += 10) {
          const columnName = `T107_C_${depth}cm_Avg`;
          if (row[columnName] !== undefined) {
            tempProfile[`temp_${depth}cm`] = row[columnName];
          }
        }
        
        return {
          timestamp: row.TIMESTAMP,
          record: row.RECORD,
          location: row.Location,
          ...tempProfile
        };
      });
      
    case 'Precipitation':
      return rows.map(row => ({
        id: row.TS_LOC_RECORD,
        timestamp: row.TIMESTAMP,
        record: row.RECORD,
        location: row.Location,
        intensity_realtime: row.Intensity_RT,
        accumulated_rt_nrt: row.Accu_RT_NRT,
        accumulated_nrt: row.Accu_NRT,
        accumulated_total_nrt: row.Accu_total_NRT,
        bucket_rt: row.Bucket_RT,
        bucket_nrt: row.Bucket_NRT,
        load_temperature: row.Load_Temp
      }));
      
    default:
      return rows;
  }
}

// Routes

// Get available databases
app.get('/api/databases', async (req, res) => {
  try {
    const databases = Object.entries(DATABASES).map(([key, name]) => ({
      key,
      name,
      displayName: key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: getDatabaseDescription(key)
    }));
    
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
    
    const attributes = columns.map(col => ({
      name: col.COLUMN_NAME,
      type: col.DATA_TYPE,
      nullable: col.IS_NULLABLE === 'YES',
      default: col.COLUMN_DEFAULT,
      comment: col.COLUMN_COMMENT || '',
      category: getAttributeCategory(col.COLUMN_NAME),
      isPrimary: ['TIMESTAMP', 'Location'].includes(col.COLUMN_NAME)
    }));
    
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

// Get unique locations from specific database and tables
app.get('/api/databases/:database/locations', async (req, res) => {
  try {
    const { database } = req.params;
    const { tables } = req.query; // comma-separated table names
    const { connection, databaseName } = await getConnectionWithDB(database);
    
    let tableList = [];
    if (tables) {
      tableList = String(tables)
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }
    
    // Use information_schema to find tables that contain a Location column (fast)
    const [locTableRows] = await connection.execute(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND COLUMN_NAME IN ('Location','location')`,
      [databaseName]
    );
    let validTables = locTableRows.map((r) => r.TABLE_NAME);

    // If specific tables were requested, intersect with valid tables
    if (tables) {
      const requested = new Set(tableList);
      validTables = validTables.filter((t) => requested.has(t));
    }

    // Additional filtering for season-based databases
    if (database === 'seasonal_clean_data') {
      // Only filter seasonal database for season-specific tables
      validTables = validTables.filter((t) => t.startsWith('cleaned_data_season_'));
    }
    // For final_clean_data, show all tables that have Location column
    
    if (validTables.length === 0) {
      connection.release();
      return res.json([]);
    }
    
    // Build union query with proper MySQL syntax
    const unionQueries = validTables.map(table => 
      `(SELECT DISTINCT Location as name FROM \`${table}\` WHERE Location IS NOT NULL AND Location != '' LIMIT 100)`
    );
    
    // Proper MySQL UNION syntax with ORDER BY at the end
    const query = `SELECT DISTINCT name FROM (${unionQueries.join(' UNION ALL ')}) AS combined_locations ORDER BY name`;
    
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

// Get data from specific database table with filters
app.get('/api/databases/:database/data/:table', async (req, res) => {
  try {
    const { database, table } = req.params;
    const { location, start_date, end_date, limit = 1000, attributes } = req.query;
    const { connection, databaseName } = await getConnectionWithDB(database);
    
    // Build column selection
    let columns = '*';
    if (attributes) {
      const selectedAttributes = attributes.split(',').map(attr => attr.trim());
      // Always include primary attributes
      const allAttributes = [...new Set(['TIMESTAMP', 'Location', ...selectedAttributes])];
      columns = allAttributes.map(attr => `\`${attr}\``).join(', ');
    }
    
    // Build query with filters
    let query = `SELECT ${columns} FROM \`${table}\` WHERE 1=1`;
    const params = [];
    
    if (location) {
      query += ' AND Location = ?';
      params.push(location);
    }
    
    if (start_date) {
      query += ' AND TIMESTAMP >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      query += ' AND TIMESTAMP <= ?';
      params.push(end_date);
    }
    
    query += ' ORDER BY TIMESTAMP DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const [rows] = await connection.execute(query, params);
    const formattedData = formatTableData(table, rows);
    
    connection.release();
    res.json({
      database: databaseName,
      table,
      data: formattedData,
      count: formattedData.length,
      query_params: { location, start_date, end_date, limit, attributes }
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Get table metadata (columns and types)
app.get('/api/metadata/:table', async (req, res) => {
  try {
    const { table } = req.params;
    
    // Validate table name
    const allowedTables = ['table1', 'Wind', 'SnowpkTempProfile', 'Precipitation'];
    if (!allowedTables.includes(table)) {
      return res.status(400).json({ error: 'Invalid table name' });
    }
    
    // Use INFORMATION_SCHEMA instead of relying on env.MYSQL_DATABASE
    const query = `
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `;
    
    // Use raw_data as default schema for metadata lookup
    const schema = DATABASES['raw_data'];
    const [columns] = await pool.execute(query, [schema, table]);
    
    res.json({
      table_name: table,
      columns: columns.map(col => ({
        name: col.COLUMN_NAME,
        type: col.DATA_TYPE,
        nullable: col.IS_NULLABLE === 'YES',
        default: col.COLUMN_DEFAULT,
        comment: col.COLUMN_COMMENT
      }))
    });
  } catch (error) {
    console.error('Error fetching metadata:', error);
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
});

// Analytics endpoint for aggregated data
app.get('/api/analytics', async (req, res) => {
  try {
    const { location, start_date, end_date } = req.query;
    
    let whereClause = ' WHERE 1=1';
    const params = [];
    
    if (location) {
      whereClause += ' AND Location = ?';
      params.push(location);
    }
    
    // Default to last 24 hours if no date range specified
    const endDate = end_date || new Date().toISOString();
    const startDate = start_date || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    whereClause += ' AND TIMESTAMP BETWEEN ? AND ?';
    params.push(startDate, endDate);
    
    // Get temperature and humidity stats from table1
    const tempQuery = `
      SELECT 
        AVG(AirTC_Avg) as avg_temp,
        MIN(AirTC_Avg) as min_temp,
        MAX(AirTC_Avg) as max_temp,
        AVG(RH) as avg_humidity,
        COUNT(*) as temp_count
      FROM table1
      ${whereClause}
    `;
    
    // Get wind stats
    const windQuery = `
      SELECT 
        AVG(WS_ms) as avg_wind_speed,
        MAX(WS_ms_Max) as max_wind_speed,
        AVG(WindDir) as avg_wind_direction,
        COUNT(*) as wind_count
      FROM Wind
      ${whereClause}
    `;
    
    // Get precipitation stats
    const precipQuery = `
      SELECT 
        SUM(Accu_total_NRT) as total_precipitation,
        AVG(Intensity_RT) as avg_intensity,
        COUNT(*) as precip_count
      FROM Precipitation
      ${whereClause}
    `;
    
    // Get snow stats from table1
    const snowQuery = `
      SELECT 
        AVG(SWE) as avg_snow_water_equivalent,
        AVG(Snowpack_Density) as avg_snowpack_density,
        COUNT(*) as snow_count
      FROM table1
      ${whereClause}
    `;
    
    // Execute all queries in parallel
    const [
      [tempRows],
      [windRows],
      [precipRows],
      [snowRows]
    ] = await Promise.all([
      pool.execute(tempQuery, params),
      pool.execute(windQuery, params),
      pool.execute(precipQuery, params),
      pool.execute(snowQuery, params)
    ]);
    
    res.json({
      temperature: {
        average: tempRows[0].avg_temp,
        min: tempRows[0].min_temp,
        max: tempRows[0].max_temp,
        count: tempRows[0].temp_count
      },
      humidity: {
        average: tempRows[0].avg_humidity
      },
      wind: {
        average_speed: windRows[0].avg_wind_speed,
        max_speed: windRows[0].max_wind_speed,
        average_direction: windRows[0].avg_wind_direction,
        count: windRows[0].wind_count
      },
      precipitation: {
        total: precipRows[0].total_precipitation,
        average_intensity: precipRows[0].avg_intensity,
        count: precipRows[0].precip_count
      },
      snow: {
        average_swe: snowRows[0].avg_snow_water_equivalent,
        average_density: snowRows[0].avg_snowpack_density,
        count: snowRows[0].snow_count
      },
      period: {
        start: startDate,
        end: endDate
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Download endpoint for CSV export with proper timestamp formatting
app.get('/api/databases/:database/download/:table', async (req, res) => {
  try {
    const { database, table } = req.params;
    const { location, start_date, end_date, attributes } = req.query;
    const { connection, databaseName } = await getConnectionWithDB(database);

    // Discover actual column names (preserve case) and identify TIMESTAMP/Location columns using INFORMATION_SCHEMA
    const [colRows] = await connection.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION`,
      [databaseName, table]
    );
    const allCols = colRows.map((c) => c.COLUMN_NAME);
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

    if (location) {
      query += ` AND \`${locCol}\` = ?`;
      params.push(location);
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

// New endpoint for getting detailed metadata
app.get('/api/metadata/locations', (req, res) => {
  try {
    const locationDetails = Object.entries(LOCATION_METADATA).map(([code, details]) => ({
      code,
      ...details,
      coordinates: `${details.latitude}, ${details.longitude}`
    }));
    
    res.json({
      project: 'CRREL S2S Project - Location Information in Vermont',
      total_locations: 22,
      description: 'Comprehensive environmental monitoring stations across Vermont',
      locations: locationDetails
    });
  } catch (error) {
    console.error('Error fetching location metadata:', error);
    res.status(500).json({ error: 'Failed to fetch location metadata' });
  }
});

// New endpoint for getting table metadata with full descriptions
app.get('/api/metadata/tables/:table', (req, res) => {
  try {
    const { table } = req.params;
    const metadata = TABLE_METADATA[table];
    
    if (!metadata) {
      return res.status(404).json({ error: 'Table metadata not found' });
    }
    
    // Add temperature profile attributes for SnowPkTempProfile
    if (table === 'SnowPkTempProfile') {
      for (let depth = 0; depth <= 290; depth += 10) {
        const attrName = `T107_C_${depth.toString().padStart(3, '0')}cm_Avg`;
        metadata.attributes[attrName] = {
          description: `Snowpack temperature profile at ${depth} CM`,
          unit: 'Deg C',
          measurement_type: 'Avg',
          category: 'Snow Temperature'
        };
      }
    }
    
    res.json({
      table_name: table,
      ...metadata,
      attribute_count: Object.keys(metadata.attributes).length
    });
  } catch (error) {
    console.error('Error fetching table metadata:', error);
    res.status(500).json({ error: 'Failed to fetch table metadata' });
  }
});

// New endpoint for bulk download requests
app.post('/api/bulk-download/request', async (req, res) => {
  try {
    const {
      name,
      email,
      organization,
      purpose,
      research_description,
      datasets_requested,
      date_range,
      preferred_format
    } = req.body;
    
    // Validate required fields
    if (!name || !email || !purpose || !datasets_requested) {
      return res.status(400).json({
        error: 'Missing required fields: name, email, purpose, datasets_requested'
      });
    }
    
    // Create request object
    const bulkRequest = {
      request_id: `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      requester: {
        name,
        email,
        organization: organization || 'Not specified'
      },
      request_details: {
        purpose,
        research_description: research_description || 'Not provided',
        datasets_requested: Array.isArray(datasets_requested) ? datasets_requested : [datasets_requested],
        date_range: date_range || 'Full dataset',
        preferred_format: preferred_format || 'CSV'
      },
      status: 'submitted',
      estimated_processing_time: '2-5 business days'
    };
    
    // Log the request (in production, this would be saved to database)
    console.log('📥 New bulk download request:', bulkRequest);
    
    // In production, send email notification to s2s@uvm.edu
    console.log(`📧 Email notification would be sent to: s2s@uvm.edu`);
    
    res.json({
      message: 'Bulk download request submitted successfully',
      request_id: bulkRequest.request_id,
      status: 'submitted',
      next_steps: [
        'Your request has been forwarded to the S2S team at s2s@uvm.edu',
        'You will receive a confirmation email within 24 hours',
        'Data preparation typically takes 2-5 business days',
        'Download links will be provided via email when ready'
      ],
      contact: {
        email: 's2s@uvm.edu',
        phone: '(802) 656-2215'
      }
    });
  } catch (error) {
    console.error('Error processing bulk download request:', error);
    res.status(500).json({ error: 'Failed to process bulk download request' });
  }
});

// Helper functions for database and table descriptions
function getDatabaseDescription(key) {
  const descriptions = {
    'raw_data': 'Raw data',
    'initial_clean_data': 'Initial clean data',
    'final_clean_data': 'Final Clean Data',
    'seasonal_clean_data': 'season wise final clean data'
  };
  return descriptions[key] || 'Environmental monitoring database';
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

// Routes
app.use('/api/bulk-download', bulkDownloadRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      host: process.env.MYSQL_HOST,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// Start server
async function startServer() {
  try {
    await connectDB();
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`🚀 Summit2Shore API server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API endpoints: http://localhost:${PORT}/api/*`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
