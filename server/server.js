const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection pool (no specific database)
let pool;

// Known database configurations
const DATABASES = {
  'raw_data': 'CRRELS2S_VTClimateRepository',
  'cleaned_data': 'CRRELS2S_cleaned_data_seasons', 
  'processed_data': 'CRRELS2S_ProcessedData',
  'main_data': 'CRRELS2S_MAIN',
  'processed_clean': 'CRRELS2S_VTClimateRepository_Processed'
};

async function connectDB() {
  try {
    // Create pool without specifying database for dynamic switching
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      multipleStatements: false
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
    
    const [tables] = await connection.execute('SHOW TABLES');
    const tableNames = tables.map(table => Object.values(table)[0]);
    
    // Get table info with row counts and descriptions
    const tablesWithInfo = await Promise.all(
      tableNames.map(async (tableName) => {
        try {
          const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM \`${tableName}\``);
          const rowCount = countResult[0].count;
          
          return {
            name: tableName,
            displayName: getTableDisplayName(tableName),
            description: getTableDescription(tableName),
            rowCount,
            primaryAttributes: ['TIMESTAMP', 'Location'] // Always present
          };
        } catch (err) {
          console.warn(`Error getting info for table ${tableName}:`, err.message);
          return {
            name: tableName,
            displayName: getTableDisplayName(tableName),
            description: 'Environmental data table',
            rowCount: 0,
            primaryAttributes: ['TIMESTAMP', 'Location']
          };
        }
      })
    );
    
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
      tableList = tables.split(',');
    } else {
      // Get all tables if none specified
      const [allTables] = await connection.execute('SHOW TABLES');
      tableList = allTables.map(table => Object.values(table)[0]);
    }
    
    // Build union query for all tables
    const unionQueries = tableList.map(table => 
      `SELECT DISTINCT Location as name FROM \`${table}\` WHERE Location IS NOT NULL`
    );
    
    if (unionQueries.length === 0) {
      connection.release();
      return res.json([]);
    }
    
    const query = unionQueries.join(' UNION ') + ' ORDER BY name';
    const [rows] = await connection.execute(query);
    
    // Add mock coordinates for now (replace with actual if you have them)
    const locationsWithCoords = rows.map((loc, index) => ({
      id: index + 1,
      name: loc.name,
      latitude: 44.0 + (index * 0.1), // Mock values - replace with real coords
      longitude: -72.5 - (index * 0.1), // Mock values - replace with real coords
      elevation: 1000 + (index * 100) // Mock values - replace with real elevation
    }));
    
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
    
    const query = `
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `;
    
    const [columns] = await pool.execute(query, [process.env.MYSQL_DATABASE, table]);
    
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

// Download endpoint for CSV export
app.get('/api/databases/:database/download/:table', async (req, res) => {
  try {
    const { database, table } = req.params;
    const { location, start_date, end_date, attributes } = req.query;
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
    
    query += ' ORDER BY TIMESTAMP DESC';
    
    const [rows] = await connection.execute(query, params);
    const formattedData = formatTableData(table, rows);
    
    // Set headers for CSV download
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${database}_${table}_${timestamp}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Convert to CSV (simple implementation)
    if (formattedData.length > 0) {
      const headers = Object.keys(formattedData[0]);
      res.write(headers.join(',') + '\n');
      
      formattedData.forEach(row => {
        const values = headers.map(header => {
          const value = row[header];
          // Handle null values and escape commas
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
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

// Helper functions for database and table descriptions
function getDatabaseDescription(key) {
  const descriptions = {
    'raw_data': 'Original unprocessed environmental data from sensors',
    'cleaned_data': 'Quality-controlled seasonal environmental data',
    'processed_data': 'Fully processed and analyzed environmental data',
    'main_data': 'Core environmental monitoring dataset',
    'processed_clean': 'Enhanced processed environmental measurements'
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

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      database_name: process.env.MYSQL_DATABASE,
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
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Database: ${process.env.MYSQL_DATABASE}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();