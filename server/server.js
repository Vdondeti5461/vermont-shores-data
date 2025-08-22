const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection pool
let pool;

async function connectDB() {
  try {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database:', process.env.MYSQL_DATABASE);
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
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

// Get unique locations from all tables
app.get('/api/locations', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT Location as name 
      FROM (
        SELECT Location FROM table1
        UNION SELECT Location FROM Wind
        UNION SELECT Location FROM SnowpkTempProfile
        UNION SELECT Location FROM Precipitation
      ) as all_locations
      WHERE Location IS NOT NULL
      ORDER BY name
    `;
    
    const [rows] = await pool.execute(query);
    
    // Add mock coordinates for now (replace with actual if you have them)
    const locationsWithCoords = rows.map((loc, index) => ({
      id: index + 1,
      name: loc.name,
      latitude: 44.0 + (index * 0.1), // Mock values - replace with real coords
      longitude: -72.5 - (index * 0.1), // Mock values - replace with real coords
      elevation: 1000 + (index * 100) // Mock values - replace with real elevation
    }));
    
    res.json(locationsWithCoords);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// Get data from specific table with filters
app.get('/api/data/:table', async (req, res) => {
  try {
    const { table } = req.params;
    const { location, start_date, end_date, limit = 1000 } = req.query;
    
    // Validate table name
    const allowedTables = ['table1', 'Wind', 'SnowpkTempProfile', 'Precipitation'];
    if (!allowedTables.includes(table)) {
      return res.status(400).json({ error: 'Invalid table name' });
    }
    
    // Build query with filters
    let query = `SELECT * FROM ${table} WHERE 1=1`;
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
    
    const [rows] = await pool.execute(query, params);
    const formattedData = formatTableData(table, rows);
    
    res.json(formattedData);
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
app.get('/api/download/:table', async (req, res) => {
  try {
    const { table } = req.params;
    const { location, start_date, end_date, columns } = req.query;
    
    // Validate table name
    const allowedTables = ['table1', 'Wind', 'SnowpkTempProfile', 'Precipitation'];
    if (!allowedTables.includes(table)) {
      return res.status(400).json({ error: 'Invalid table name' });
    }
    
    // Build column selection
    const selectedColumns = columns ? columns.split(',') : ['*'];
    const columnString = selectedColumns.join(', ');
    
    // Build query with filters
    let query = `SELECT ${columnString} FROM ${table} WHERE 1=1`;
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
    
    const [rows] = await pool.execute(query, params);
    const formattedData = formatTableData(table, rows);
    
    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${table}_${Date.now()}.csv"`);
    
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
    
    res.end();
  } catch (error) {
    console.error('Error downloading data:', error);
    res.status(500).json({ error: 'Failed to download data' });
  }
});

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