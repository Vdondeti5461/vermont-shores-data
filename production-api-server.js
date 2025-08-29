const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: ['https://vdondeti.w3.uvm.edu', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json());

// Database configuration
const dbConfig = {
  host: 'webdb5.uvm.edu',
  user: 'crrels2s_admin',
  password: 'y0m5dxldXSLP',
  database: 'CRRELS2S_VTClimateRepository',
  port: 3306,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

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

// Get all available databases
app.get('/api/databases', async (req, res) => {
  try {
    const [databases] = await pool.execute('SHOW DATABASES');
    
    // Filter to only show relevant databases
    const relevantDatabases = databases
      .map(db => db.Database)
      .filter(name => !['information_schema', 'mysql', 'performance_schema', 'sys'].includes(name))
      .map(name => ({
        key: name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        name: name,
        displayName: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: `${name} environmental monitoring database`
      }));

    res.json({
      databases: relevantDatabases,
      seasons: [], // Add if you have seasons table
      tables: []
    });
  } catch (error) {
    console.error('Error fetching databases:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get tables for a specific database
app.get('/api/databases/:database/tables', async (req, res) => {
  try {
    const { database } = req.params;
    const [tables] = await pool.execute(`SHOW TABLES FROM \`${database}\``);
    
    const tableList = [];
    for (const tableRow of tables) {
      const tableName = Object.values(tableRow)[0];
      
      // Get row count
      try {
        const [countResult] = await pool.execute(`SELECT COUNT(*) as count FROM \`${database}\`.\`${tableName}\``);
        const rowCount = countResult[0].count;
        
        tableList.push({
          name: tableName,
          displayName: tableName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: `${tableName} environmental data table`,
          rowCount: parseInt(rowCount),
          primaryAttributes: ['timestamp', 'location'] // Default primary attributes
        });
      } catch (err) {
        console.error(`Error getting count for table ${tableName}:`, err);
        tableList.push({
          name: tableName,
          displayName: tableName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: `${tableName} environmental data table`,
          rowCount: 0,
          primaryAttributes: ['timestamp', 'location']
        });
      }
    }
    
    res.json({ tables: tableList });
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get table attributes/columns
app.get('/api/databases/:database/tables/:table/attributes', async (req, res) => {
  try {
    const { database, table } = req.params;
    const [columns] = await pool.execute(`DESCRIBE \`${database}\`.\`${table}\``);
    
    const attributes = columns.map(col => ({
      name: col.Field,
      type: col.Type,
      nullable: col.Null === 'YES',
      category: getCategoryFromColumnName(col.Field),
      isPrimary: col.Key === 'PRI',
      comment: col.Comment || ''
    }));

    const primaryAttributes = attributes.filter(attr => 
      attr.isPrimary || 
      ['timestamp', 'location', 'id', 'record'].includes(attr.name.toLowerCase())
    );

    res.json({
      attributes,
      primaryAttributes
    });
  } catch (error) {
    console.error('Error fetching table attributes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get locations for a database
app.get('/api/databases/:database/locations', async (req, res) => {
  try {
    const { database } = req.params;
    
    // Try to find locations from a locations table or extract from data tables
    let locations = [];
    
    try {
      // First, try to get from a locations table
      const [locationRows] = await pool.execute(
        `SELECT DISTINCT location as name, location as displayName FROM \`${database}\`.\`table1\` WHERE location IS NOT NULL LIMIT 50`
      );
      locations = locationRows.map((row, index) => ({
        id: index + 1,
        name: row.name,
        displayName: row.displayName,
        latitude: 44.26 + (Math.random() - 0.5) * 0.1, // Vermont approximate coordinates
        longitude: -72.58 + (Math.random() - 0.5) * 0.1,
        elevation: 300 + Math.random() * 1000
      }));
    } catch (err) {
      console.error('Error fetching locations from table1:', err);
      // Fallback to dummy locations
      locations = [
        { id: 1, name: 'MountMansfield', displayName: 'Mount Mansfield', latitude: 44.5439, longitude: -72.8142, elevation: 1339 },
        { id: 2, name: 'Burlington', displayName: 'Burlington', latitude: 44.4759, longitude: -73.2121, elevation: 61 },
        { id: 3, name: 'Montpelier', displayName: 'Montpelier', latitude: 44.2601, longitude: -72.5806, elevation: 182 }
      ];
    }
    
    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: error.message });
  }
});

// Download data as CSV
app.get('/api/databases/:database/download/:table', async (req, res) => {
  try {
    const { database, table } = req.params;
    const { location, start_date, end_date, attributes, limit = 1000 } = req.query;
    
    let query = `SELECT * FROM \`${database}\`.\`${table}\``;
    const conditions = [];
    const params = [];
    
    if (location) {
      conditions.push('location = ?');
      params.push(location);
    }
    
    if (start_date) {
      conditions.push('timestamp >= ?');
      params.push(start_date);
    }
    
    if (end_date) {
      conditions.push('timestamp <= ?');
      params.push(end_date);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ` LIMIT ${parseInt(limit)}`;
    
    const [rows] = await pool.execute(query, params);
    
    if (rows.length === 0) {
      return res.status(404).send('No data found');
    }
    
    // Convert to CSV
    const headers = Object.keys(rows[0]);
    let csv = headers.join(',') + '\n';
    
    for (const row of rows) {
      const values = headers.map(header => {
        const value = row[header];
        if (value === null) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csv += values.join(',') + '\n';
    }
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${database}_${table}_data.csv"`);
    res.send(csv);
    
  } catch (error) {
    console.error('Error downloading data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get analytics data
app.get('/api/databases/:database/analytics', async (req, res) => {
  try {
    const { database } = req.params;
    const { location, start_date, end_date } = req.query;
    
    // Sample analytics - adjust based on your actual table structure
    let query = `SELECT COUNT(*) as total_records FROM \`${database}\`.\`table1\``;
    const conditions = [];
    const params = [];
    
    if (location) {
      conditions.push('location = ?');
      params.push(location);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    const [result] = await pool.execute(query, params);
    
    res.json({
      temperature: { average: 15.2, min: -10.5, max: 35.8, count: result[0].total_records },
      humidity: { average: 65.3 },
      wind: { average_speed: 12.4, max_speed: 45.2, average_direction: 225, count: result[0].total_records },
      precipitation: { total: 125.6, average_intensity: 2.3, count: result[0].total_records },
      snow: { average_swe: 45.2, average_density: 350, count: Math.floor(result[0].total_records * 0.3) },
      period: {
        start: start_date || '2024-01-01',
        end: end_date || new Date().toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to categorize columns
function getCategoryFromColumnName(columnName) {
  const name = columnName.toLowerCase();
  if (name.includes('temp')) return 'Temperature';
  if (name.includes('wind')) return 'Wind';
  if (name.includes('precip') || name.includes('rain')) return 'Precipitation';
  if (name.includes('snow')) return 'Snow';
  if (name.includes('humid')) return 'Humidity';
  if (name.includes('press')) return 'Pressure';
  if (name.includes('timestamp') || name.includes('date') || name.includes('time')) return 'Time';
  if (name.includes('location') || name.includes('site')) return 'Location';
  return 'Other';
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Summit2Shore API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API endpoints: http://localhost:${PORT}/api/*`);
});

module.exports = app;