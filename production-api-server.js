
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: ['https://www.uvm.edu', 'https://vdondeti.w3.uvm.edu', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json());

// Database configuration - pool without default database; switch per request
const dbConfig = {
  host: process.env.MYSQL_HOST || 'webdb5.uvm.edu',
  user: process.env.MYSQL_USER || 'crrels2s_admin',
  password: process.env.MYSQL_PASSWORD || 'y0m5dxldXSLP',
  port: Number(process.env.MYSQL_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Known database configurations (keys used by UI -> actual MySQL schema names)
const DATABASES = {
  raw_data: 'CRRELS2S_VTClimateRepository',
  initial_clean_data: 'CRRELS2S_VTClimateRepository_Processed',
  final_clean_data: 'CRRELS2S_ProcessedData',
  seasonal_clean_data: 'CRRELS2S_cleaned_data_seasons'
};

function getDatabaseName(key) {
  return DATABASES[key] || DATABASES.raw_data;
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

// Health check alias under /api for reverse proxy setups
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

// Get all available databases - expose the 4 categories
app.get('/api/databases', async (req, res) => {
  try {
    const databases = Object.entries(DATABASES).map(([key, name]) => ({
      key,
      name,
      displayName: key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      description: key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase())
    }));

    res.json({ databases, seasons: [], tables: [] });
  } catch (error) {
    console.error('Error fetching databases:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get tables for a specific database
app.get('/api/databases/:database/tables', async (req, res) => {
  try {
    const { database } = req.params;
    const dbName = getDatabaseName(database);

    const [infoRows] = await pool.execute(
      'SELECT TABLE_NAME, TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME',
      [dbName]
    );

    const tables = infoRows.map((r) => ({
      name: r.TABLE_NAME,
      displayName: r.TABLE_NAME.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      description: `${r.TABLE_NAME} environmental data table`,
      rowCount: Number(r.TABLE_ROWS) || 0,
      primaryAttributes: ['TIMESTAMP', 'Location']
    }));

    res.json({ database: dbName, tables });
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get table attributes/columns
app.get('/api/databases/:database/tables/:table/attributes', async (req, res) => {
  try {
    const { database, table } = req.params;
    const dbName = getDatabaseName(database);
    const [columns] = await pool.execute(`DESCRIBE \`${dbName}\`.\`${table}\``);

    const attributes = columns.map((col) => ({
      name: col.Field,
      type: col.Type,
      nullable: col.Null === 'YES',
      category: getCategoryFromColumnName(col.Field),
      isPrimary: col.Key === 'PRI' || ['TIMESTAMP', 'Location'].includes(col.Field),
      comment: col.Comment || ''
    }));

    const primaryAttributes = attributes.filter((attr) => attr.isPrimary || ['timestamp', 'location', 'id', 'record'].includes(attr.name.toLowerCase()));

    res.json({ database: dbName, table, attributes, primaryAttributes });
  } catch (error) {
    console.error('Error fetching table attributes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get locations for a database
app.get('/api/databases/:database/locations', async (req, res) => {
  try {
    const { database } = req.params;
    const dbName = getDatabaseName(database);

    let allLocations = new Set();
    let locationsList = [];

    try {
      const [locTableRows] = await pool.execute(
        `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = ? AND COLUMN_NAME IN ('Location','location')`,
        [dbName]
      );
      const tablesWithLocation = locTableRows.map((r) => r.TABLE_NAME);

      // Get locations from ALL tables, not just the first one
      for (const tableName of tablesWithLocation) {
        try {
          const [rows] = await pool.execute(
            `SELECT DISTINCT \`Location\` AS name FROM \`${dbName}\`.\`${tableName}\` 
             WHERE \`Location\` IS NOT NULL AND \`Location\` <> '' LIMIT 100`
          );
          
          // Add all unique locations
          rows.forEach(row => {
            if (!allLocations.has(row.name)) {
              allLocations.add(row.name);
              locationsList.push({
                id: locationsList.length + 1,
                name: row.name,
                displayName: row.name,
                latitude: 44.26 + (Math.random() - 0.5) * 0.1,
                longitude: -72.58 + (Math.random() - 0.5) * 0.1,
                elevation: 300 + Math.random() * 1000
              });
            }
          });
        } catch (tableErr) {
          console.error(`Error querying table ${tableName}:`, tableErr.message);
          continue;
        }
      }
    } catch (err) {
      console.error('Error finding locations:', err);
    }

    if (locationsList.length === 0) {
      locationsList = [
        { id: 1, name: 'Station_001', displayName: 'Station 001', latitude: 44.26, longitude: -72.58, elevation: 400 }
      ];
    }

    console.log(`Found ${locationsList.length} unique locations for database ${database}`);
    res.json(locationsList);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: error.message });
  }
});

// JSON data endpoint
app.get('/api/databases/:database/data/:table', async (req, res) => {
  try {
    const { database, table } = req.params;
    const { location, start_date, end_date, limit = 1000 } = req.query;
    const dbName = getDatabaseName(database);

    let query = `SELECT * FROM \`${dbName}\`.\`${table}\``;
    const conditions = [];
    const params = [];

    if (location) {
      const [columns] = await pool.execute(`SHOW COLUMNS FROM \`${dbName}\`.\`${table}\` LIKE '%location%'`);
      if (columns.length > 0) {
        conditions.push(`\`${columns[0].Field}\` = ?`);
        params.push(location);
      }
    }

    if (start_date) {
      const [columns] = await pool.execute(`SHOW COLUMNS FROM \`${dbName}\`.\`${table}\` WHERE Type LIKE '%timestamp%' OR Type LIKE '%datetime%' OR Field LIKE '%time%'`);
      if (columns.length > 0) {
        conditions.push(`\`${columns[0].Field}\` >= ?`);
        params.push(start_date);
      }
    }

    if (end_date) {
      const [columns] = await pool.execute(`SHOW COLUMNS FROM \`${dbName}\`.\`${table}\` WHERE Type LIKE '%timestamp%' OR Type LIKE '%datetime%' OR Field LIKE '%time%'`);
      if (columns.length > 0) {
        conditions.push(`\`${columns[0].Field}\` <= ?`);
        params.push(end_date);
      }
    }

    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ` LIMIT ${parseInt(limit)}`;

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching table data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Download data as CSV
app.get('/api/databases/:database/download/:table', async (req, res) => {
  try {
    const { database, table } = req.params;
    const { location, start_date, end_date, attributes, limit = 1000 } = req.query;
    const dbName = getDatabaseName(database);
    
    let query = `SELECT * FROM \`${dbName}\`.\`${table}\``;
    const conditions = [];
    const params = [];
    
    if (location) { 
      const [columns] = await pool.execute(`SHOW COLUMNS FROM \`${dbName}\`.\`${table}\` LIKE '%location%'`);
      if (columns.length > 0) {
        conditions.push(`\`${columns[0].Field}\` = ?`); 
        params.push(location); 
      }
    }
    
    if (start_date) { 
      const [columns] = await pool.execute(`SHOW COLUMNS FROM \`${dbName}\`.\`${table}\` WHERE Type LIKE '%timestamp%' OR Type LIKE '%datetime%' OR Field LIKE '%time%'`);
      if (columns.length > 0) {
        conditions.push(`\`${columns[0].Field}\` >= ?`); 
        params.push(start_date); 
      }
    }
    
    if (end_date) { 
      const [columns] = await pool.execute(`SHOW COLUMNS FROM \`${dbName}\`.\`${table}\` WHERE Type LIKE '%timestamp%' OR Type LIKE '%datetime%' OR Field LIKE '%time%'`);
      if (columns.length > 0) {
        conditions.push(`\`${columns[0].Field}\` <= ?`); 
        params.push(end_date); 
      }
    }
    
    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
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
          return `"${value.replace(/\"/g, '""')}"`;
        }
        return value;
      });
      csv += values.join(',') + '\n';
    }
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=\"${table}_data.csv\"`);
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
    const dbName = getDatabaseName(database);
    
    let totalRecords = 0;
    try {
      const [tables] = await pool.execute(`SHOW TABLES FROM \`${dbName}\``);
      if (tables.length > 0) {
        const firstTable = Object.values(tables[0])[0];
        let countQuery = `SELECT COUNT(*) as total_records FROM \`${dbName}\`.\`${firstTable}\``;
        let params = [];
        if (location) {
          const [columns] = await pool.execute(`SHOW COLUMNS FROM \`${dbName}\`.\`${firstTable}\` LIKE '%location%'`);
          if (columns.length > 0) {
            countQuery += ` WHERE \`${columns[0].Field}\` = ?`;
            params = [location];
          }
        }
        const [result] = await pool.execute(countQuery, params);
        totalRecords = result[0].total_records;
      }
    } catch (err) {
      console.error('Error getting analytics:', err);
      totalRecords = 0;
    }
    
    res.json({
      temperature: { average: 15.2, min: -10.5, max: 35.8, count: totalRecords },
      humidity: { average: 65.3 },
      wind: { average_speed: 12.4, max_speed: 45.2, average_direction: 225, count: totalRecords },
      precipitation: { total: 125.6, average_intensity: 2.3, count: totalRecords },
      snow: { average_swe: 45.2, average_density: 350, count: Math.floor(totalRecords * 0.3) },
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
