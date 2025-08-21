# Database Configuration Guide

## Where to Update Your Database Details

### 1. Server Configuration (server/.env)
Create a `.env` file in the `server/` directory with your database details:

```env
# MySQL Database Configuration
MYSQL_HOST=your_database_host
MYSQL_USER=your_database_username
MYSQL_PASSWORD=your_database_password
MYSQL_DATABASE=your_database_name
MYSQL_PORT=3306

# Server Configuration
PORT=3001
```

### 2. Database Schema Mapping (server/server.js)
Update the table and column mappings in the `mapTableData()` function (lines 35-126):

```javascript
// Current schema mapping (lines 45-125)
switch(tableName) {
  case 'your_temperature_table':
    return {
      ...mapped,
      // Map your actual column names to standard format
      temperature: row.your_temp_column,
      humidity: row.your_humidity_column,
      // Add more mappings as needed
    };
}
```

### 3. Table Names (server/server.js)
Update the allowed table names in line 179:
```javascript
const allowedTables = ['your_table1', 'your_table2', 'your_table3'];
```

### 4. Location Data Source (server/server.js)
Update the locations query in line 134 to match your schema:
```javascript
// If you have a dedicated locations table:
query = 'SELECT id, name, latitude, longitude, elevation FROM your_locations_table';

// Or if extracting from data tables:
query = 'SELECT DISTINCT your_location_column as name FROM your_data_table';
```

### 5. Analytics Queries (server/server.js)
Update the analytics queries (lines 247-307) to match your column names:
```javascript
// Temperature metrics example (line 247)
SELECT 
  AVG(your_temp_column) as avg_temp, 
  MIN(your_temp_column) as min_temp, 
  MAX(your_temp_column) as max_temp
FROM your_temperature_table
```

## Quick Setup Steps

1. Copy `server/.env.example` to `server/.env`
2. Edit `.env` with your database credentials
3. Update table names in `allowedTables` array
4. Map your column names in `mapTableData()` function
5. Update analytics queries to use your column names
6. Restart the server: `cd server && npm start`

## Testing Connection

Visit `http://localhost:3001/health` to check database connection status.