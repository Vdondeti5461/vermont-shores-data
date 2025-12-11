/**
 * Summit2Shore API Server
 * Production-ready REST API for environmental data access
 * 
 * Features:
 * - JWT Authentication
 * - API Key Management
 * - Rate Limiting
 * - Audit Logging
 * - Multi-database support
 */

require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const helmet = require('helmet');

// Import middleware and routes
const { verifyApiKey, optionalToken } = require('./middleware/auth.middleware');
const { createRateLimiter, logApiUsage, cleanupRateLimits } = require('./middleware/rateLimit.middleware');
const authRoutes = require('./routes/auth.routes');
const apiKeyRoutes = require('./routes/apiKeys.routes');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// SECURITY MIDDLEWARE
// ============================================
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: [
    'https://www.uvm.edu',
    'https://crrels2s.w3.uvm.edu',
    'https://vdondeti.w3.uvm.edu',
    'http://localhost:5173',
    'http://localhost:3000',
    // Lovable preview domains
    /https:\/\/.*\.lovableproject\.com$/,
    /https:\/\/.*\.lovable\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

app.use(express.json({ limit: '10mb' }));

// Trust proxy for accurate IP detection
app.set('trust proxy', true);

// ============================================
// DATABASE CONFIGURATION
// ============================================
let pool;

const DATABASES = {
  'raw_data': 'CRRELS2S_raw_data_ingestion',
  'stage_clean_data': 'CRRELS2S_stage_clean_data',
  'stage_qaqc_data': 'CRRELS2S_stage_qaqc_data',
  'seasonal_qaqc_data': 'CRRELS2S_seasonal_qaqc_data'
};

// Public databases (no auth required)
const PUBLIC_DATABASES = ['seasonal_qaqc_data'];

async function connectDB() {
  try {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'webdb5.uvm.edu',
      user: process.env.MYSQL_USER || 'crrels2s_admin',
      password: process.env.MYSQL_PASSWORD,
      port: Number(process.env.MYSQL_PORT) || 3306,
      waitForConnections: true,
      connectionLimit: 20,
      queueLimit: 0,
      multipleStatements: false,
      connectTimeout: 30000
    });
    
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL server');
    connection.release();
    return pool;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

async function getConnectionWithDB(databaseKey) {
  const databaseName = DATABASES[databaseKey];
  if (!databaseName) {
    throw new Error(`Unknown database: ${databaseKey}`);
  }
  
  const connection = await pool.getConnection();
  await connection.query(`USE \`${databaseName}\``);
  return { connection, databaseName };
}

// ============================================
// LOCATION METADATA
// ============================================
const LOCATION_METADATA = {
  'SUMM': { name: 'Mansfield Summit', latitude: 44.52796261, longitude: -72.81496117, elevation: 1169 },
  'RB01': { name: 'Ranch Brook #1', latitude: 44.52322238, longitude: -72.80863215, elevation: 1075 },
  'RB02': { name: 'Ranch Brook #2', latitude: 44.51775982, longitude: -72.81039188, elevation: 910 },
  'RB03': { name: 'Ranch Brook #3', latitude: 44.51481829, longitude: -72.80905263, elevation: 795 },
  'RB04': { name: 'Ranch Brook #4', latitude: 44.51097861, longitude: -72.80281519, elevation: 640 },
  'RB05': { name: 'Ranch Brook #5', latitude: 44.5044967, longitude: -72.79947434, elevation: 505 },
  'RB06': { name: 'Ranch Brook #6', latitude: 44.50370285, longitude: -72.78352521, elevation: 414 },
  'RB07': { name: 'Ranch Brook #7', latitude: 44.51528492, longitude: -72.78513705, elevation: 613 },
  'RB08': { name: 'Ranch Brook #8', latitude: 44.50953955, longitude: -72.78220384, elevation: 472 },
  'RB09': { name: 'Ranch Brook #9', latitude: 44.48905, longitude: -72.79285, elevation: 847 },
  'RB10': { name: 'Ranch Brook #10', latitude: 44.49505, longitude: -72.78639, elevation: 624 },
  'RB11': { name: 'Ranch Brook #11', latitude: 44.50545202, longitude: -72.7713791, elevation: 388 },
  'RB12': { name: 'Ranch Brook #12', latitude: 44.51880228, longitude: -72.79785548, elevation: 884 },
  'UNDR': { name: 'Mansfield West SCAN', latitude: 44.53511455, longitude: -72.83462236, elevation: 698 },
  'PROC': { name: 'Mansfield West Proctor', latitude: 44.5285819, longitude: -72.866737, elevation: 418 },
  'SR01': { name: 'Sleepers R3/Main', latitude: 44.48296257, longitude: -72.16464901, elevation: 553 },
  'SR11': { name: 'Sleepers W1/R11', latitude: 44.45002119, longitude: -72.06714939, elevation: 225 },
  'SR25': { name: 'Sleepers R25', latitude: 44.47682346, longitude: -72.12582909, elevation: 357 },
  'JRCL': { name: 'Jericho Clearing', latitude: 44.447694, longitude: -73.00228357, elevation: 199 },
  'JRFO': { name: 'Jericho Forest', latitude: 44.44780437, longitude: -73.00270872, elevation: 196 },
  'SPST': { name: 'Spear St', latitude: 44.45258109, longitude: -73.19181715, elevation: 87 },
  'PTSH': { name: 'Potash Brook', latitude: 44.44489861, longitude: -73.21425398, elevation: 45 }
};

// ============================================
// REQUEST LOGGING
// ============================================
app.use('/api', (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// ============================================
// HEALTH CHECK ENDPOINTS
// ============================================
app.get('/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    
    // Test database access
    const [result] = await connection.execute('SELECT 1 as test');
    connection.release();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      database: {
        connected: true,
        host: process.env.MYSQL_HOST || 'webdb5.uvm.edu'
      },
      authentication: {
        jwt: true,
        apiKey: true
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================
// AUTHENTICATION ROUTES (No rate limit)
// ============================================
// These will be initialized after pool is created

// ============================================
// DATABASE DISCOVERY ENDPOINTS
// ============================================

/**
 * GET /api/databases
 * List available databases based on auth level
 */
app.get('/api/databases', verifyApiKey(() => pool), (req, res) => {
  try {
    let availableDatabases;
    
    if (req.accessLevel === 'authenticated') {
      // Authenticated users get all databases
      availableDatabases = Object.keys(DATABASES);
    } else {
      // Public access only gets seasonal QAQC
      availableDatabases = PUBLIC_DATABASES;
    }
    
    const databases = availableDatabases.map((key, index) => ({
      id: DATABASES[key],
      key: key,
      name: DATABASES[key],
      displayName: key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      description: getDatabaseDescription(key),
      requiresAuth: !PUBLIC_DATABASES.includes(key),
      order: index + 1
    }));
    
    res.json({
      success: true,
      access_level: req.accessLevel,
      databases
    });
  } catch (error) {
    console.error('Error fetching databases:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to fetch databases'
    });
  }
});

/**
 * GET /api/seasonal/tables
 * List seasonal tables (public access)
 */
app.get('/api/seasonal/tables', async (req, res) => {
  try {
    const { connection, databaseName } = await getConnectionWithDB('seasonal_qaqc_data');
    
    const [rows] = await connection.execute(
      `SELECT TABLE_NAME, TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME LIKE '%_qaqc' 
       ORDER BY TABLE_NAME DESC`,
      [databaseName]
    );

    const tables = rows.map(row => {
      const tableName = row.TABLE_NAME;
      const seasonMatch = tableName.match(/season_(\d{4})_(\d{4})_qaqc/);
      
      return {
        id: tableName,
        name: tableName,
        displayName: seasonMatch ? `Season ${seasonMatch[1]}-${seasonMatch[2]}` : tableName,
        rowCount: row.TABLE_ROWS || 0,
        description: `Quality-controlled seasonal environmental data`
      };
    });

    connection.release();
    
    res.json({
      success: true,
      tables
    });
  } catch (error) {
    console.error('Error fetching seasonal tables:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to fetch seasonal tables'
    });
  }
});

/**
 * GET /api/seasonal/tables/:table/attributes
 * Get column metadata for a seasonal table
 */
app.get('/api/seasonal/tables/:table/attributes', async (req, res) => {
  try {
    const { table } = req.params;
    const { connection, databaseName } = await getConnectionWithDB('seasonal_qaqc_data');

    const [columns] = await connection.execute(
      `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_COMMENT
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
       ORDER BY ORDINAL_POSITION`,
      [databaseName, table]
    );

    const attributes = columns.map(col => ({
      name: col.COLUMN_NAME,
      type: col.DATA_TYPE,
      nullable: col.IS_NULLABLE === 'YES',
      description: col.COLUMN_COMMENT || col.COLUMN_NAME,
      unit: extractUnit(col.COLUMN_NAME),
      category: getAttributeCategory(col.COLUMN_NAME)
    }));

    connection.release();

    res.json({
      success: true,
      table,
      attributes
    });
  } catch (error) {
    console.error('Error fetching attributes:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to fetch table attributes'
    });
  }
});

/**
 * GET /api/seasonal/tables/:table/locations
 * Get monitoring locations for a seasonal table
 */
app.get('/api/seasonal/tables/:table/locations', async (req, res) => {
  try {
    const { table } = req.params;
    const { connection } = await getConnectionWithDB('seasonal_qaqc_data');

    const [cols] = await connection.query(`SHOW COLUMNS FROM \`${table}\``);
    const locCol = cols.find(c => c.Field.toLowerCase() === 'location')?.Field || 'location';

    const [rows] = await connection.execute(
      `SELECT DISTINCT \`${locCol}\` AS code FROM \`${table}\` 
       WHERE \`${locCol}\` IS NOT NULL ORDER BY \`${locCol}\``
    );

    const locations = rows
      .filter(row => !['SleepersMain_SR01', 'Sleepers_W1', 'Sleepers_R25'].includes(row.code))
      .map(row => {
        const meta = LOCATION_METADATA[row.code] || LOCATION_METADATA[row.code.replace('-', '')];
        return {
          code: row.code,
          name: meta?.name || row.code,
          latitude: meta?.latitude || null,
          longitude: meta?.longitude || null,
          elevation: meta?.elevation || null
        };
      });

    connection.release();

    res.json({
      success: true,
      table,
      locations
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to fetch locations'
    });
  }
});

/**
 * GET /api/seasonal/download/:table
 * Download seasonal data as CSV
 */
app.get('/api/seasonal/download/:table', async (req, res) => {
  try {
    const { table } = req.params;
    const { locations, start_date, end_date, attributes } = req.query;
    
    const { connection } = await getConnectionWithDB('seasonal_qaqc_data');

    // Get column info
    const [colRows] = await connection.query(`SHOW COLUMNS FROM \`${table}\``);
    const allCols = colRows.map(c => c.Field);
    const colMap = new Map(allCols.map(c => [c.toLowerCase(), c]));
    const tsCol = colMap.get('timestamp') || 'TIMESTAMP';
    const locCol = colMap.get('location') || 'Location';

    // Determine selected columns
    let selected;
    if (attributes) {
      const requested = String(attributes).split(',').map(a => a.trim());
      const mapped = requested.map(a => colMap.get(a.toLowerCase()) || a);
      selected = Array.from(new Set([tsCol, locCol, ...mapped])).filter(c => allCols.includes(c));
    } else {
      selected = allCols;
    }

    // Build query
    const selectList = selected.map(c => {
      if (c.toLowerCase() === 'timestamp') {
        return `DATE_FORMAT(\`${tsCol}\`, '%Y-%m-%d %H:%i:%s') AS timestamp`;
      }
      return `\`${c}\``;
    }).join(', ');

    let query = `SELECT ${selectList} FROM \`${table}\` WHERE 1=1`;
    const params = [];

    if (locations) {
      const locationList = locations.split(',').map(l => l.trim()).filter(Boolean);
      if (locationList.length > 0) {
        query += ` AND \`${locCol}\` IN (${locationList.map(() => '?').join(',')})`;
        params.push(...locationList);
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

    query += ` ORDER BY \`${tsCol}\` ASC`;

    const [rows] = await connection.execute(query, params);
    connection.release();

    // Generate CSV
    const filename = `summit2shore_${table}_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Metadata header
    res.write(`# Summit2Shore Environmental Data Portal\n`);
    res.write(`# Dataset: ${table}\n`);
    res.write(`# Generated: ${new Date().toISOString()}\n`);
    res.write(`# Date Range: ${start_date || 'All'} to ${end_date || 'All'}\n`);
    res.write(`# Locations: ${locations || 'All'}\n`);
    res.write(`# Total Records: ${rows.length}\n`);
    res.write(`# API Version: 2.0.0\n`);
    res.write(`#\n`);

    if (rows.length > 0) {
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

    res.end();
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      error: 'DOWNLOAD_ERROR',
      message: 'Failed to download data'
    });
  }
});

/**
 * GET /api/databases/:database/tables
 * List tables in a database (requires auth for non-public databases)
 */
app.get('/api/databases/:database/tables', verifyApiKey(() => pool), async (req, res) => {
  try {
    const { database } = req.params;

    // Check access
    if (!PUBLIC_DATABASES.includes(database) && req.accessLevel !== 'authenticated') {
      return res.status(403).json({
        success: false,
        error: 'ACCESS_DENIED',
        message: 'API key required to access this database'
      });
    }

    const { connection, databaseName } = await getConnectionWithDB(database);
    
    const [rows] = await connection.execute(
      `SELECT TABLE_NAME, TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME`,
      [databaseName]
    );

    const tables = rows.map(row => ({
      name: row.TABLE_NAME,
      displayName: getTableDisplayName(row.TABLE_NAME),
      rowCount: row.TABLE_ROWS || 0
    }));

    connection.release();

    res.json({
      success: true,
      database: databaseName,
      tables
    });
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to fetch tables'
    });
  }
});

/**
 * GET /api/databases/:database/tables/:table/attributes
 */
app.get('/api/databases/:database/tables/:table/attributes', verifyApiKey(() => pool), async (req, res) => {
  try {
    const { database, table } = req.params;

    if (!PUBLIC_DATABASES.includes(database) && req.accessLevel !== 'authenticated') {
      return res.status(403).json({
        success: false,
        error: 'ACCESS_DENIED',
        message: 'API key required'
      });
    }

    const { connection, databaseName } = await getConnectionWithDB(database);

    const [columns] = await connection.execute(
      `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_COMMENT
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
       ORDER BY ORDINAL_POSITION`,
      [databaseName, table]
    );

    connection.release();

    res.json({
      success: true,
      database: databaseName,
      table,
      attributes: columns.map(col => ({
        name: col.COLUMN_NAME,
        type: col.DATA_TYPE,
        nullable: col.IS_NULLABLE === 'YES',
        unit: extractUnit(col.COLUMN_NAME)
      }))
    });
  } catch (error) {
    console.error('Error fetching attributes:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to fetch attributes'
    });
  }
});

/**
 * GET /api/databases/:database/locations
 */
/**
 * GET /api/databases/:database/tables/:table/locations
 * Get locations from a specific table dynamically
 */
app.get('/api/databases/:database/tables/:table/locations', verifyApiKey(() => pool), async (req, res) => {
  try {
    const { database, table } = req.params;

    if (!PUBLIC_DATABASES.includes(database) && req.accessLevel !== 'authenticated') {
      return res.status(403).json({
        success: false,
        error: 'ACCESS_DENIED',
        message: 'API key required'
      });
    }

    const { connection, databaseName } = await getConnectionWithDB(database);

    // Get location column name
    const [cols] = await connection.query(`SHOW COLUMNS FROM \`${table}\``);
    const locCol = cols.find(c => c.Field.toLowerCase() === 'location')?.Field || 'location';

    // Fetch distinct locations from the table
    const [rows] = await connection.execute(
      `SELECT DISTINCT \`${locCol}\` AS code FROM \`${table}\` 
       WHERE \`${locCol}\` IS NOT NULL ORDER BY \`${locCol}\``
    );

    connection.release();

    // Filter deprecated location codes and map to metadata
    const locations = rows
      .filter(row => !['SleepersMain_SR01', 'Sleepers_W1', 'Sleepers_R25'].includes(row.code))
      .map(row => {
        const meta = LOCATION_METADATA[row.code] || LOCATION_METADATA[row.code.replace('-', '')];
        return {
          code: row.code,
          name: meta?.name || row.code,
          latitude: meta?.latitude || null,
          longitude: meta?.longitude || null,
          elevation: meta?.elevation || null
        };
      });

    console.log(`✅ [LOCATIONS] Found ${locations.length} locations in ${databaseName}.${table}`);

    res.json({
      success: true,
      database: databaseName,
      table,
      locations
    });
  } catch (error) {
    console.error('Error fetching table locations:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to fetch locations'
    });
  }
});

app.get('/api/databases/:database/locations', verifyApiKey(() => pool), async (req, res) => {
  try {
    const { database } = req.params;

    if (!PUBLIC_DATABASES.includes(database) && req.accessLevel !== 'authenticated') {
      return res.status(403).json({
        success: false,
        error: 'ACCESS_DENIED',
        message: 'API key required'
      });
    }

    // Return all known locations with metadata
    const locations = Object.entries(LOCATION_METADATA).map(([code, meta]) => ({
      code,
      ...meta
    }));

    res.json({
      success: true,
      locations
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to fetch locations'
    });
  }
});

/**
 * GET /api/databases/:database/download/:table
 */
app.get('/api/databases/:database/download/:table', verifyApiKey(() => pool), async (req, res) => {
  try {
    const { database, table } = req.params;
    const { locations, start_date, end_date, attributes, limit = 100000 } = req.query;

    if (!PUBLIC_DATABASES.includes(database) && req.accessLevel !== 'authenticated') {
      return res.status(403).json({
        success: false,
        error: 'ACCESS_DENIED',
        message: 'API key required to download from this database'
      });
    }

    const { connection, databaseName } = await getConnectionWithDB(database);

    // Get columns
    const [colRows] = await connection.query(`SHOW COLUMNS FROM \`${table}\``);
    const allCols = colRows.map(c => c.Field);
    const colMap = new Map(allCols.map(c => [c.toLowerCase(), c]));
    const tsCol = colMap.get('timestamp') || 'TIMESTAMP';
    const locCol = colMap.get('location') || 'Location';

    // Build query
    let selected = allCols;
    if (attributes) {
      const requested = String(attributes).split(',').map(a => a.trim());
      selected = [tsCol, locCol, ...requested.map(a => colMap.get(a.toLowerCase()) || a)]
        .filter((c, i, arr) => allCols.includes(c) && arr.indexOf(c) === i);
    }

    const selectList = selected.map(c => {
      if (c.toLowerCase() === 'timestamp') {
        return `DATE_FORMAT(\`${c}\`, '%Y-%m-%d %H:%i:%s') AS timestamp`;
      }
      return `\`${c}\``;
    }).join(', ');

    let query = `SELECT ${selectList} FROM \`${table}\` WHERE 1=1`;
    const params = [];

    if (locations) {
      const locationList = locations.split(',').map(l => l.trim()).filter(Boolean);
      query += ` AND \`${locCol}\` IN (${locationList.map(() => '?').join(',')})`;
      params.push(...locationList);
    }

    if (start_date) {
      query += ` AND \`${tsCol}\` >= ?`;
      params.push(start_date);
    }
    if (end_date) {
      query += ` AND \`${tsCol}\` <= ?`;
      params.push(end_date);
    }

    query += ` ORDER BY \`${tsCol}\` ASC LIMIT ?`;
    params.push(parseInt(limit));

    const [rows] = await connection.execute(query, params);
    connection.release();

    const filename = `summit2shore_${database}_${table}_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.write(`# Summit2Shore Environmental Data\n`);
    res.write(`# Database: ${databaseName}\n`);
    res.write(`# Table: ${table}\n`);
    res.write(`# Generated: ${new Date().toISOString()}\n`);
    res.write(`# Records: ${rows.length}\n`);
    res.write(`#\n`);

    if (rows.length > 0) {
      const headers = Object.keys(rows[0]);
      res.write(headers.join(',') + '\n');
      rows.forEach(row => {
        const values = headers.map(h => {
          const v = row[h];
          if (v === null || v === undefined) return '';
          const s = String(v);
          return s.includes(',') ? `"${s}"` : s;
        });
        res.write(values.join(',') + '\n');
      });
    }

    res.end();
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      error: 'DOWNLOAD_ERROR',
      message: 'Failed to download data'
    });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================
function getDatabaseDescription(key) {
  const descriptions = {
    'raw_data': 'Raw sensor data directly from field loggers',
    'stage_clean_data': 'Cleaned data with basic quality control',
    'stage_qaqc_data': 'Quality-assured and quality-controlled data',
    'seasonal_qaqc_data': 'Seasonal QAQC datasets for analysis'
  };
  return descriptions[key] || 'Environmental monitoring data';
}

function getTableDisplayName(tableName) {
  return tableName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

function getAttributeCategory(name) {
  const lower = name.toLowerCase();
  if (lower.includes('temp')) return 'Temperature';
  if (lower.includes('wind')) return 'Wind';
  if (lower.includes('precip')) return 'Precipitation';
  if (lower.includes('snow') || lower.includes('swe')) return 'Snow';
  if (lower.includes('soil')) return 'Soil';
  if (lower.includes('radiation')) return 'Radiation';
  if (lower.includes('humidity') || lower.includes('rh')) return 'Humidity';
  if (lower === 'timestamp') return 'Time';
  if (lower === 'location') return 'Location';
  return 'Other';
}

function extractUnit(name) {
  const lower = name.toLowerCase();
  if (lower.endsWith('_c') || lower.includes('temperature_c')) return '°C';
  if (lower.includes('percent') || lower.endsWith('_pct')) return '%';
  if (lower.endsWith('_mm')) return 'mm';
  if (lower.endsWith('_cm')) return 'cm';
  if (lower.includes('_kg_m3')) return 'kg/m³';
  if (lower.includes('_w_m2')) return 'W/m²';
  if (lower.includes('_m_s') || lower.includes('_ms')) return 'm/s';
  if (lower.includes('_deg')) return '°';
  if (lower.includes('timestamp')) return 'DateTime';
  return '';
}

// ============================================
// SERVER STARTUP
// ============================================
async function startServer() {
  try {
    await connectDB();
    
    // Initialize auth routes with pool - MUST be before error handlers
    app.use('/auth', authRoutes(pool));
    app.use('/api-keys', apiKeyRoutes(pool));
    
    // Apply rate limiting to API routes (after auth routes are set up)
    app.use('/api', createRateLimiter(pool));
    app.use('/api', logApiUsage(pool));
    
    // ============================================
    // ERROR HANDLING - Must be AFTER all routes
    // ============================================
    app.use((err, req, res, next) => {
      console.error('Server error:', err);
      res.status(500).json({
        success: false,
        error: 'SERVER_ERROR',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
      });
    });

    // 404 handler - Must be last
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: `Endpoint ${req.method} ${req.path} not found`,
        documentation: 'https://crrels2s.w3.uvm.edu/documentation'
      });
    });
    
    // Schedule rate limit cleanup
    setInterval(() => cleanupRateLimits(pool), 60 * 60 * 1000);
    
    app.listen(PORT, () => {
      console.log(`🚀 Summit2Shore API Server running on port ${PORT}`);
      console.log(`📚 API Documentation: https://crrels2s.w3.uvm.edu/documentation`);
      console.log(`🔐 Authentication: JWT + API Key`);
      console.log(`📍 Auth routes: /auth/signup, /auth/login, /auth/verify, /auth/logout, /auth/profile`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
