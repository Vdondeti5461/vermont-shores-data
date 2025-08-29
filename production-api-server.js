require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: ['https://www.uvm.edu', 'https://vdondeti.w3.uvm.edu', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json());

// Database configuration for web5.uvm.edu
const dbConfig = {
  host: 'web5.uvm.edu',
  user: process.env.MYSQL_USER || 'crrels2s_admin',
  password: process.env.MYSQL_PASSWORD || 'y0m5dxldXSLP',
  port: Number(process.env.MYSQL_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Database configurations (4 databases as specified)
const DATABASES = {
  raw_data: 'CRRELS2S_VTClimateRepository',
  initial_clean_data: 'CRRELS2S_VTClimateRepository_Processed', 
  final_clean_data: 'CRRELS2S_ProcessedData',
  seasonal_clean_data: 'CRREL52S_cleaned_data_seasons'
};

// Table metadata as provided by user
const TABLE_METADATA = {
  table1: {
    displayName: 'Table1 - Environmental Data',
    description: 'Primary environmental data including temperature, humidity, soil measurements',
    attributes: {
      'TS_LOC_REC': { description: 'TimeStamp Location Record', unit: 'No_Unit', type: 'TS' },
      'TIMESTAMP': { description: 'TimeStamp', unit: 'No_Unit', type: 'TS' },
      'LOCATION': { description: 'Location', unit: 'No_Unit', type: 'LOC' },
      'Record': { description: 'Record Number', unit: 'No_Unit', type: 'RN' },
      'Batt_Volt_Min': { description: 'Battery Voltage', unit: 'Volts', type: 'Min' },
      'P_Temp': { description: 'Panel Temperature (Reference Temperature Measurement)', unit: 'Deg C', type: 'smp' },
      'AirTC_Avg': { description: 'Air Temperature Average in Celcius', unit: 'Deg C', type: 'Avg' },
      'RH': { description: 'Relative Humidity', unit: '%', type: 'Smp' },
      'SHF': { description: 'Soil Heat Flux ( radiation Parameter)', unit: 'W/m^2', type: 'smp' },
      'Soil_Moisture': { description: 'Soil Moisture', unit: 'wfv', type: 'smp' },
      'Soil_Temperature_C': { description: 'Soil Temperature in Celcius', unit: 'Deg C', type: 'smp' },
      'SWE': { description: 'Snow water Equivalent', unit: 'mm of H20', type: 'smp' },
      'Ice_content': { description: 'Ice content of SnowPack', unit: '%', type: 'smp' },
      'Water_Content': { description: 'Water Content of SnowPack', unit: '%', type: 'smp' },
      'Snowpack_Density': { description: 'Snowpack Density', unit: 'kg/m^3', type: 'smp' },
      'SW_in': { description: 'Short wave radiation incoming', unit: 'W/m^2', type: 'smp' },
      'SW_out': { description: 'Short wave radiation outgoing', unit: 'W/m^2', type: 'smp' },
      'LW_in': { description: 'Longwave radation incoming', unit: 'W/m^2', type: 'smp' },
      'LW_out': { description: 'Longwave radiation outgoing', unit: 'W/m^2', type: 'smp' },
      'Target_Depth': { description: 'Target depth', unit: 'cm', type: 'smp' },
      'Qual': { description: 'Quality numbers (snow sensor)', unit: 'No_Unit', type: 'smp' },
      'TCDT': { description: 'Temperature corrected distance value', unit: 'No_Unit', type: 'smp' },
      'DBTCDT': { description: 'Snow Depth', unit: 'cm', type: 'smp' }
    }
  },
  wind: {
    displayName: 'Wind - Wind Measurements',
    description: 'Wind speed and direction measurements',
    attributes: {
      'TIMESTAMP': { description: 'TimeStamp', unit: 'No_Unit', type: 'TS' },
      'LOCATION': { description: 'Location', unit: 'No_Unit', type: 'LOC' },
      'Record': { description: 'Record Number', unit: 'No_Unit', type: 'RN' },
      'WindDir': { description: 'Wind Direction', unit: 'deg', type: 'smp' },
      'WS_ms_Max': { description: 'Max wind speed', unit: 'meters/second', type: 'Max' },
      'WS_ms_TMx': { description: 'Wind Speed', unit: 'meters/second', type: 'TMx' },
      'WS_ms': { description: 'Wind speed', unit: 'meters/second', type: 'smp' },
      'WS_ms_S_WVT': { description: 'Wind Speed', unit: 'meters/second', type: 'Wvc' },
      'WindDir_D1_WVT': { description: 'Wind Direction', unit: 'Deg', type: 'Wvc' },
      'WindDir_SD1_WVT': { description: 'Wind Direction', unit: 'Deg', type: 'Wvc' },
      'WS_ms_Min': { description: 'Min wind speed', unit: 'meters/second', type: 'Min' },
      'WS_ms_TMn': { description: 'Wind Speed', unit: 'meters/second', type: 'TMn' }
    }
  },
  precipitation: {
    displayName: 'Precipitation - Rainfall Data', 
    description: 'Precipitation and rainfall measurements',
    attributes: {
      'TIMESTAMP': { description: 'TimeStamp', unit: 'No_Unit', type: 'TS' },
      'LOCATION': { description: 'Location', unit: 'No_Unit', type: 'LOC' },
      'Record': { description: 'Record Number', unit: 'No_Unit', type: 'RN' },
      'Intensity_RT': { description: 'Intensity Real time', unit: 'mm/min', type: 'smp' },
      'Accu_NRT': { description: 'Accmulated Non real time Precepitation', unit: 'mm', type: 'smp' },
      'Accu_RT_NRT': { description: 'Accmulated real time - Non Real time Precepitation', unit: 'mm', type: 'smp' },
      'Accu_Total_NRT': { description: 'Accmulated Total Non real time Precepitation', unit: 'mm', type: 'smp' },
      'Bucket_NRT': { description: 'Bucket Percipitation Non real time', unit: 'mm', type: 'smp' },
      'Bucket_RT': { description: 'Bucket Precipitation real time', unit: 'mm', type: 'smp' },
      'Load_Temp': { description: 'Load Temperature (Battery)', unit: 'Deg C', type: 'smp' }
    }
  },
  snowpktempprofile: {
    displayName: 'SnowPkTempProfile - Snow Temperature Profile',
    description: 'Snowpack temperature profile measurements at different depths',
    attributes: {
      'TIMESTAMP': { description: 'TimeStamp', unit: 'No_Unit', type: 'TS' },
      'LOCATION': { description: 'Location', unit: 'No_Unit', type: 'LOC' },
      'Record': { description: 'Record Number', unit: 'No_Unit', type: 'RN' },
      'T107_C_0cm_Avg': { description: 'Snowpack temperature profile at 0 CM', unit: 'Deg C', type: 'Avg' }
      // Note: Additional temperature profiles from 0cm to 290cm will be dynamically discovered
    }
  }
};

// 22 Locations as specified by user
const LOCATION_CODES = {
  'RB01': 'Mansfield East Ranch Brook 1',
  'RB02': 'Mansfield East Ranch Brook 2', 
  'RB03': 'Mansfield East Ranch Brook 3',
  'RB04': 'Mansfield East Ranch Brook 4',
  'RB05': 'Mansfield East Ranch Brook 5',
  'RB06': 'Mansfield East Ranch Brook 6',
  'RB07': 'Mansfield East Ranch Brook 7',
  'RB08': 'Mansfield East Ranch Brook 8',
  'RB09': 'Mansfield East Ranch Brook 9',
  'RB10': 'Mansfield East Ranch Brook 10',
  'RB11': 'Mansfield East Ranch Brook 11',
  'RB12': 'Mansfield East FEMC',
  'SPER': 'Spear Street',
  'SR01': 'Sleepers R3/Main',
  'SR11': 'Sleepers W1/R11', 
  'SR25': 'Sleepers R25',
  'JRCL': 'Jericho clearing',
  'JRFO': 'Jericho Forest',
  'PROC': 'Mansfield West Proctor',
  'PTSH': 'Potash Brook',
  'SUMM': 'Mansfield SUMMIT',
  'UNDR': 'Mansfield West SCAN'
};

// Helper functions
function getDatabaseName(key) {
  return DATABASES[key] || DATABASES.raw_data;
}

function getDatabaseDescription(key) {
  const descriptions = {
    raw_data: 'Raw environmental sensor data from Vermont monitoring stations',
    initial_clean_data: 'Initially processed and cleaned environmental data',
    final_clean_data: 'Final processed environmental data ready for analysis',
    seasonal_clean_data: 'Seasonally aggregated and cleaned environmental data'
  };
  return descriptions[key] || 'Environmental monitoring data';
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

// Get all available databases
app.get('/api/databases', async (req, res) => {
  try {
    const databases = Object.entries(DATABASES).map(([key, name]) => ({
      key,
      name,
      displayName: key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      description: getDatabaseDescription(key)
    }));

    res.json({ databases });
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

    // Get actual tables from database
    const [rows] = await pool.execute(
      'SELECT TABLE_NAME, TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME',
      [dbName]
    );

    const tables = rows.map(row => {
      const tableName = row.TABLE_NAME.toLowerCase();
      const metadata = TABLE_METADATA[tableName] || {
        displayName: row.TABLE_NAME,
        description: `${row.TABLE_NAME} data table`
      };

      return {
        name: row.TABLE_NAME,
        displayName: metadata.displayName,
        description: metadata.description,
        rowCount: Number(row.TABLE_ROWS) || 0,
        primaryAttributes: ['TIMESTAMP', 'LOCATION']
      };
    });

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

    const tableKey = table.toLowerCase();
    const tableMetadata = TABLE_METADATA[tableKey];

    const attributes = columns.map(col => {
      const attrMetadata = tableMetadata?.attributes?.[col.Field] || {};
      
      return {
        name: col.Field,
        type: col.Type,
        nullable: col.Null === 'YES',
        category: getCategoryFromColumnName(col.Field),
        isPrimary: col.Key === 'PRI' || ['TIMESTAMP', 'LOCATION'].includes(col.Field),
        comment: attrMetadata.description || col.Comment || '',
        unit: attrMetadata.unit || 'No_Unit',
        measurementType: attrMetadata.type || 'smp'
      };
    });

    res.json({ database: dbName, table, attributes });
  } catch (error) {
    console.error('Error fetching table attributes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get locations - return all 22 locations for every database/table
app.get('/api/databases/:database/locations', async (req, res) => {
  try {
    // Always return all 22 locations regardless of database or table
    // This matches user requirement: "show every Location available for tables it might be any database"
    const locations = Object.entries(LOCATION_CODES).map(([code, name], index) => ({
      id: index + 1,
      name: code,
      displayName: name,
      latitude: 44.25 + (index * 0.01), // Dummy coordinates
      longitude: -72.58 - (index * 0.01),
      elevation: 500 + (index * 10)
    }));

    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: error.message });
  }
});

// Data download endpoint
app.get('/api/databases/:database/download/:table', async (req, res) => {
  try {
    const { database, table } = req.params;
    const { location, start_date, end_date, attributes } = req.query;
    const dbName = getDatabaseName(database);

    // Build query conditions
    let whereConditions = [];
    let queryParams = [];

    // Handle location filter (single or multiple)
    if (location) {
      const locations = Array.isArray(location) ? location : location.split(',');
      const locationPlaceholders = locations.map(() => '?').join(',');
      whereConditions.push(`LOCATION IN (${locationPlaceholders})`);
      queryParams.push(...locations);
    }

    // Handle date filters
    if (start_date) {
      whereConditions.push(`TIMESTAMP >= ?`);
      queryParams.push(start_date);
    }

    if (end_date) {
      whereConditions.push(`TIMESTAMP <= ?`);
      queryParams.push(end_date);
    }

    // Build SELECT clause
    let selectClause = '*';
    if (attributes) {
      const attrList = attributes.split(',').map(attr => `\`${attr.trim()}\``).join(', ');
      selectClause = attrList;
    }

    // Build final query
    let query = `SELECT ${selectClause} FROM \`${dbName}\`.\`${table}\``;
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    query += ` ORDER BY TIMESTAMP ASC`;

    const [rows] = await pool.execute(query, queryParams);

    // Set CSV headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${database}_${table}_${new Date().toISOString().split('T')[0]}.csv"`);

    // Generate CSV content
    if (rows.length === 0) {
      res.send('No data found for the specified criteria');
      return;
    }

    // CSV header
    const headers = Object.keys(rows[0]);
    let csvContent = headers.join(',') + '\n';

    // CSV data rows - keep timestamps exactly as they are in database
    for (const row of rows) {
      const csvRow = headers.map(header => {
        let value = row[header];
        
        // Keep timestamp exactly as stored in database (no formatting)
        if (value instanceof Date) {
          // If it's a Date object, format to YYYY-MM-DD HH:mm:ss
          value = value.toISOString().replace('T', ' ').substring(0, 19);
        } else if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
          // If it's already a string timestamp, keep as-is
          value = value;
        }
        
        // Handle null values and escape commas/quotes
        if (value === null || value === undefined) {
          return '';
        }
        
        value = String(value);
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        
        return value;
      }).join(',');
      
      csvContent += csvRow + '\n';
    }

    res.send(csvContent);
  } catch (error) {
    console.error('Error downloading data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to categorize columns
function getCategoryFromColumnName(columnName) {
  const name = columnName.toLowerCase();
  
  if (name.includes('temp') || name.includes('temperature')) return 'Temperature';
  if (name.includes('wind')) return 'Wind';
  if (name.includes('precip') || name.includes('rain')) return 'Precipitation';
  if (name.includes('snow') || name.includes('ice')) return 'Snow/Ice';
  if (name.includes('soil')) return 'Soil';
  if (name.includes('radiation') || name.includes('sw_') || name.includes('lw_')) return 'Radiation';
  if (name.includes('humidity') || name.includes('rh')) return 'Humidity';
  if (name.includes('battery') || name.includes('volt') || name.includes('batt')) return 'System';
  if (name.includes('timestamp') || name.includes('location') || name.includes('record')) return 'Metadata';
  
  return 'Other';
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database host: ${dbConfig.host}`);
});
