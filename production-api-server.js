
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
  'SPST': { name: 'Spear Street', latitude: 44.4759, longitude: -73.1959, elevation: 120 },
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

function getDatabaseName(key) {
  if (!key) return DATABASES.raw_data;
  const normalized = String(key).toLowerCase().replace(/[\s-]/g, '_');
  return DATABASES[normalized] || DATABASES.raw_data;
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
      description: getDatabaseDescription(key)
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
    const { tables } = req.query; // comma-separated table names
    const dbName = getDatabaseName(database);

    let tableList = [];
    if (tables) {
      tableList = tables.split(',');
    } else {
      // Get all tables if none specified
      const [allTables] = await pool.execute(`SHOW TABLES FROM \`${dbName}\``);
      tableList = allTables.map(table => Object.values(table)[0]);
    }

    // Use information_schema to find tables that contain a Location column (case-insensitive)
    const [locCols] = await pool.execute(
      `SELECT TABLE_NAME, COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND (
         LOWER(COLUMN_NAME) = 'location' OR
         LOWER(COLUMN_NAME) LIKE '%location%' OR
         LOWER(COLUMN_NAME) IN ('site','sitename','site_code','station','stationname')
       )`,
      [dbName]
    );
    // Build best location column per table using a heuristic
    const candidates = new Map();
    for (const r of locCols) {
      const arr = candidates.get(r.TABLE_NAME) || [];
      arr.push(r.COLUMN_NAME);
      candidates.set(r.TABLE_NAME, arr);
    }
    function scoreCol(name) {
      const n = String(name).toLowerCase();
      if (n === 'location') return 100;
      if (n.endsWith('location') || n.includes('location')) return 90;
      if (n === 'site' || n === 'sitename' || n === 'site_code') return 80;
      if (n === 'station' || n === 'stationname') return 70;
      return 0;
    }
    const tableLocMap = {};
    for (const [table, cols] of candidates.entries()) {
      cols.sort((a, b) => scoreCol(b) - scoreCol(a));
      tableLocMap[table] = cols[0];
    }
    let validTables = Object.keys(tableLocMap);

    // If specific tables were requested, intersect with valid tables
    if (tables) {
      const requested = new Set(tableList);
      validTables = validTables.filter((t) => requested.has(t));
    }

    // Additional filtering for season-based databases
    if (database === 'seasonal_clean_data') {
      validTables = validTables.filter((t) => t.startsWith('cleaned_data_season_'));
    }

    if (validTables.length === 0) {
      return res.json([]);
    }

    // Build union query with schema-qualified tables and exact Location column per table
    const unionQueries = validTables.map((table) => {
      const col = tableLocMap[table];
      return `(SELECT DISTINCT TRIM(\`${col}\`) AS name FROM \`${dbName}\`.\`${table}\` WHERE \`${col}\` IS NOT NULL AND \`${col}\` <> '')`;
    });

    const query = `SELECT DISTINCT name FROM (${unionQueries.join(' UNION ALL ')}) AS combined_locations ORDER BY name`;

    const [rows] = await pool.execute(query);

    // Normalize aliases to canonical codes and attach metadata
    const aliasMap = {
      'Sleepers_R25': 'SR25',
      'Sleepers_W1': 'SR11',
      'SleepersMain_SR01': 'SR01',
      'SPST': 'SPER'
    };

    const seen = new Set();
    const result = [];
    rows.forEach((loc, idx) => {
      const raw = String(loc.name || '').trim();
      if (!raw) return;
      const code = aliasMap[raw] || raw;
      if (seen.has(code)) return;
      seen.add(code);
      const meta = LOCATION_METADATA[code] || LOCATION_METADATA[raw];
      result.push({
        id: result.length + 1,
        name: code,
        displayName: meta?.name || raw,
        latitude: meta?.latitude ?? 44.0 + (idx * 0.01),
        longitude: meta?.longitude ?? -72.5 - (idx * 0.01),
        elevation: meta?.elevation ?? 1000 + (idx * 10)
      });
    });

    res.json(result);
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

// Helper function for database descriptions
function getDatabaseDescription(key) {
  const descriptions = {
    'raw_data': 'Raw data',
    'initial_clean_data': 'Initial clean data',
    'final_clean_data': 'Final Clean Data',
    'seasonal_clean_data': 'season wise final clean data'
  };
  return descriptions[key] || 'Environmental monitoring database';
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
