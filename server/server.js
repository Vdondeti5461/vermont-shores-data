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

// Routes

// Get all locations
app.get('/api/locations', async (req, res) => {
  try {
    const [rows] = await connection.execute('SELECT * FROM locations ORDER BY name');
    const locations = rows.map(row => ({
      id: row.TS_LOC_RECORD,
      name: row.Location,
      latitude: parseFloat(row.latitude || 0),
      longitude: parseFloat(row.longitude || 0),
      elevation: row.elevation ? parseFloat(row.elevation) : undefined,
      status: 'active'
    }));
    res.json({ locations });
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
    res.json({ data: rows });
  } catch (error) {
    console.error(`Error fetching ${req.params.table} data:`, error);
    res.status(500).json({ error: `Failed to fetch ${req.params.table} data` });
  }
});

// Get analytics summary
app.get('/api/analytics', async (req, res) => {
  try {
    const { location_id } = req.query;
    
    // Get current metrics (last 24 hours)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    let locationFilter = '';
    const params = [last24Hours];
    
    if (location_id) {
      locationFilter = ' AND Location = ?';
      params.push(location_id);
    }

    // Temperature metrics
    const [tempRows] = await connection.execute(`
      SELECT AVG(PTemp) as avg_temp, MIN(PTemp) as min_temp, MAX(PTemp) as max_temp, COUNT(*) as count
      FROM temperature_data 
      WHERE TIMESTAMP >= ?${locationFilter}
    `, params);

    // Wind metrics
    const [windRows] = await connection.execute(`
      SELECT AVG(WS_ms) as avg_wind, MIN(WS_ms) as min_wind, MAX(WS_ms) as max_wind
      FROM wind_data 
      WHERE TIMESTAMP >= ?${locationFilter}
    `, params);

    // Precipitation metrics
    const [precipRows] = await connection.execute(`
      SELECT AVG(Accu_RT_NRT) as avg_precip, SUM(Accu_RT_NRT) as total_precip
      FROM precipitation_data 
      WHERE TIMESTAMP >= ?${locationFilter}
    `, params);

    // Recent hourly data (last 48 hours)
    const last48Hours = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const hourlyParams = [last48Hours];
    
    if (location_id) {
      hourlyParams.push(location_id);
    }

    const [recentData] = await connection.execute(`
      SELECT 
        DATE_FORMAT(TIMESTAMP, '%Y-%m-%d %H:00:00') as hour,
        AVG(PTemp) as avg_temperature
      FROM temperature_data 
      WHERE TIMESTAMP >= ?${locationFilter}
      GROUP BY DATE_FORMAT(TIMESTAMP, '%Y-%m-%d %H:00:00')
      ORDER BY hour DESC
      LIMIT 48
    `, hourlyParams);

    const analytics = {
      current_metrics: {
        temperature: tempRows[0],
        wind: windRows[0],
        precipitation: precipRows[0]
      },
      recent_data: recentData
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
async function startServer() {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer().catch(console.error);