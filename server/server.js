const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'summit2shore',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
};

let connection;

async function connectDB() {
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

// Helper function to map your table structure to standardized format
function mapTableData(tableName, rows) {
  return rows.map(row => {
    const mapped = {
      id: row.TS_LOC_RECORD || row.RECORD || row.id,
      timestamp: row.TIMESTAMP,
      record: row.RECORD,
      location: row.Location,
    };

    // Add table-specific fields based on your schema
    switch(tableName) {
      case 'temperature_data':
        return {
          ...mapped,
          battery_voltage: row.Batt_volt_Min,
          temperature: row.PTemp,
          air_temperature: row.AirTC_Avg,
          relative_humidity: row.RH,
          specific_humidity: row.shf,
          soil_moisture: row.Soil_Moisture,
          soil_temperature: row.Soil_Temperature_C,
          snow_water_equivalent: row.SWE,
          ice_content: row.Ice_Content,
          water_content: row.Water_Content,
          snowpack_density: row.Snowpack_Density,
          solar_radiation_in: row.SW_in,
          solar_radiation_out: row.SW_out,
          longwave_radiation_in: row.LW_in,
          longwave_radiation_out: row.LW_out,
          target_depth: row.Target_Depth,
          quality: row.Qual,
          total_column_depth: row.TCDT,
          depth_temperature: row.DBTCDT,
          quality_flag: row.DataQualityFlag
        };
      
      case 'wind_data':
        return {
          ...mapped,
          wind_direction: row.WindDir,
          wind_speed_max: row.WS_ms_Max,
          wind_speed_time_max: row.WS_ms_TMx,
          wind_speed: row.WS_ms,
          wind_speed_scalar: row.WS_ms_S_WVT,
          wind_direction_d1: row.WindDir_D1_WVT,
          wind_direction_sd1: row.WindDir_SD1_WVT,
          wind_speed_min: row.WS_ms_Min,
          wind_speed_time_min: row.WS_ms_TMn
        };
      
      case 'precipitation_data':
        return {
          ...mapped,
          intensity_rt: row.Intensity_RT,
          accumulation_rt: row.Accu_RT_NRT,
          accumulation_nrt: row.Accu_NRT,
          accumulation_total: row.Accu_total_NRT,
          bucket_rt: row.Bucket_RT,
          bucket_nrt: row.Bucket_NRT,
          load_temperature: row.Load_Temp
        };
      
      case 'snow_data':
        return {
          ...mapped,
          battery_voltage: row.Batt_volt_Min,
          temperature: row.PTemp,
          air_temperature: row.AirTC_Avg,
          relative_humidity: row.RH,
          specific_humidity: row.shf,
          soil_moisture: row.Soil_Moisture,
          soil_temperature: row.Soil_Temperature_C,
          snow_water_equivalent: row.SWE,
          ice_content: row.Ice_Content,
          water_content: row.Water_Content,
          snowpack_density: row.Snowpack_Density,
          solar_radiation_in: row.SW_in,
          solar_radiation_out: row.SW_out,
          longwave_radiation_in: row.LW_in,
          longwave_radiation_out: row.LW_out,
          target_depth: row.Target_Depth,
          quality: row.Qual,
          total_column_depth: row.TCDT,
          depth_temperature: row.DBTCDT,
          quality_flag: row.DataQualityFlag
        };
      
      default:
        return { ...mapped, ...row };
    }
  });
}

// Routes

// Get all locations (assuming locations table exists or extracting from other tables)
app.get('/api/locations', async (req, res) => {
  try {
    // Try to get from locations table first, fallback to distinct locations from data tables
    let query = 'SELECT DISTINCT Location as name, Location as id FROM temperature_data ORDER BY Location';
    
    try {
      // If you have a dedicated locations table, use this instead:
      // query = 'SELECT * FROM locations ORDER BY name';
      const [rows] = await connection.execute(query);
      
      const locations = rows.map((row, index) => ({
        id: row.id || row.name,
        name: row.name,
        latitude: row.latitude || 44.0 + (index * 0.1), // Default coordinates for Vermont
        longitude: row.longitude || -72.5 + (index * 0.1),
        elevation: row.elevation || 500,
        status: 'active'
      }));
      
      res.json({ locations });
    } catch (error) {
      console.log('No dedicated locations table, using distinct locations from data');
      const [rows] = await connection.execute(query);
      
      const locations = rows.map((row, index) => ({
        id: row.name,
        name: row.name,
        latitude: 44.0 + (index * 0.1), // Default coordinates for Vermont
        longitude: -72.5 + (index * 0.1),
        elevation: 500,
        status: 'active'
      }));
      
      res.json({ locations });
    }
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// Get environmental data from any table
app.get('/api/data/:table', async (req, res) => {
  try {
    const { table } = req.params;
    const { location_id, start_date, end_date, limit = 1000 } = req.query;

    // Validate table name to prevent SQL injection
    const allowedTables = ['temperature_data', 'wind_data', 'precipitation_data', 'snow_data'];
    if (!allowedTables.includes(table)) {
      return res.status(400).json({ error: 'Invalid table name' });
    }

    let query = `SELECT * FROM ${table}`;
    const params = [];
    const conditions = [];

    if (location_id) {
      conditions.push('Location = ?');
      params.push(location_id);
    }

    if (start_date) {
      conditions.push('TIMESTAMP >= ?');
      params.push(start_date);
    }

    if (end_date) {
      conditions.push('TIMESTAMP <= ?');
      params.push(end_date);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY TIMESTAMP DESC';
    
    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
    }

    const [rows] = await connection.execute(query, params);
    const mappedData = mapTableData(table, rows);
    
    res.json({ data: mappedData });
  } catch (error) {
    console.error(`Error fetching ${req.params.table} data:`, error);
    res.status(500).json({ error: `Failed to fetch ${req.params.table} data` });
  }
});

// Get analytics summary with real data from your tables
app.get('/api/analytics', async (req, res) => {
  try {
    const { location_id } = req.query;
    
    // Get current metrics (last 24 hours)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
    
    let locationFilter = '';
    const params = [last24Hours];
    
    if (location_id) {
      locationFilter = ' AND Location = ?';
      params.push(location_id);
    }

    let analytics = {
      current_metrics: {},
      recent_data: []
    };

    // Temperature metrics from temperature_data table
    try {
      const [tempRows] = await connection.execute(`
        SELECT 
          AVG(PTemp) as avg_temp, 
          MIN(PTemp) as min_temp, 
          MAX(PTemp) as max_temp, 
          COUNT(*) as count
        FROM temperature_data 
        WHERE TIMESTAMP >= ?${locationFilter}
      `, params);

      analytics.current_metrics.temperature = tempRows[0];
    } catch (error) {
      console.log('Temperature data not available');
    }

    // Wind metrics from wind_data table
    try {
      const [windRows] = await connection.execute(`
        SELECT 
          AVG(WS_ms) as avg_wind, 
          MIN(WS_ms) as min_wind, 
          MAX(WS_ms) as max_wind
        FROM wind_data 
        WHERE TIMESTAMP >= ?${locationFilter}
      `, params);

      analytics.current_metrics.wind = windRows[0];
    } catch (error) {
      console.log('Wind data not available');
    }

    // Precipitation metrics from precipitation_data table
    try {
      const [precipRows] = await connection.execute(`
        SELECT 
          AVG(Accu_RT_NRT) as avg_precip, 
          SUM(Accu_RT_NRT) as total_precip
        FROM precipitation_data 
        WHERE TIMESTAMP >= ?${locationFilter}
      `, params);

      analytics.current_metrics.precipitation = precipRows[0];
    } catch (error) {
      console.log('Precipitation data not available');
    }

    // Snow metrics from snow_data table
    try {
      const [snowRows] = await connection.execute(`
        SELECT 
          AVG(SWE) as avg_swe, 
          MIN(SWE) as min_swe, 
          MAX(SWE) as max_swe
        FROM snow_data 
        WHERE TIMESTAMP >= ?${locationFilter}
      `, params);

      analytics.current_metrics.snow = snowRows[0];
    } catch (error) {
      console.log('Snow data not available');
    }

    // Recent hourly data (last 48 hours) - combining available data
    const last48Hours = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
    const hourlyParams = [last48Hours];
    
    if (location_id) {
      hourlyParams.push(location_id);
    }

    try {
      const [recentData] = await connection.execute(`
        SELECT 
          DATE_FORMAT(TIMESTAMP, '%Y-%m-%d %H:00:00') as hour,
          AVG(PTemp) as avg_temperature,
          Location
        FROM temperature_data 
        WHERE TIMESTAMP >= ?${locationFilter}
        GROUP BY DATE_FORMAT(TIMESTAMP, '%Y-%m-%d %H:00:00'), Location
        ORDER BY hour DESC
        LIMIT 48
      `, hourlyParams);

      analytics.recent_data = recentData;
    } catch (error) {
      console.log('Recent data not available');
    }

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: connection ? 'Connected' : 'Disconnected'
  });
});

// Start server
async function startServer() {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Health check available at http://localhost:${port}/health`);
  });
}

startServer().catch(console.error);