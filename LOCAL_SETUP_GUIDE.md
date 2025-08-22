# Local Database Setup Guide

## Database Configuration

Your MySQL database is configured with the following details:

### Connection Information
- **Host**: webdb5.uvm.edu
- **User**: crrels2s_admin
- **Password**: y0m5dxldXSLP
- **Databases**: 
  - CRRELS2S_VTClimateRepository (Primary)
  - CRRELS2S_VTClimateRepository_Processed

### Available Tables

#### 1. table1 (Environmental Monitoring Data)
Primary environmental measurements including:
- Temperature (Air, Soil)
- Humidity
- Solar radiation (SW/LW in/out)
- Snow metrics (SWE, density, ice/water content)
- Soil properties

#### 2. Wind (Wind Measurements)
Wind data including:
- Wind direction
- Wind speed (avg, min, max)
- Vector components
- Timestamps for extremes

#### 3. SnowpkTempProfile (Snow Temperature Profile)
Temperature measurements at depths from 0cm to 290cm in 10cm increments

#### 4. Precipitation (Precipitation Data)
Precipitation measurements including:
- Real-time intensity
- Accumulated amounts
- Bucket measurements

## Setup Instructions

### 1. Install Server Dependencies
```bash
cd server
npm install
```

### 2. Verify Database Configuration
The `.env` file in the `server` directory should contain:
```env
MYSQL_HOST=webdb5.uvm.edu
MYSQL_USER=crrels2s_admin
MYSQL_PASSWORD=y0m5dxldXSLP
MYSQL_DATABASE=CRRELS2S_VTClimateRepository
MYSQL_PORT=3306
PORT=3001
```

### 3. Start the Backend Server
```bash
cd server
npm start
```

The server will run on `http://localhost:3001`

### 4. Start the Frontend
In a new terminal:
```bash
npm run dev
```

The frontend will run on `http://localhost:8080`

## API Endpoints

### Core Endpoints

1. **Get Locations**
   - `GET /api/locations`
   - Returns all unique locations from all tables

2. **Get Table Data**
   - `GET /api/data/:table`
   - Parameters:
     - `location`: Filter by location name
     - `start_date`: Start date (ISO format)
     - `end_date`: End date (ISO format)
     - `limit`: Number of records (default: 1000)
   - Available tables: `table1`, `Wind`, `SnowpkTempProfile`, `Precipitation`

3. **Get Table Metadata**
   - `GET /api/metadata/:table`
   - Returns column information for specified table

4. **Get Analytics**
   - `GET /api/analytics`
   - Parameters:
     - `location`: Optional location filter
     - `start_date`: Start date (default: 24 hours ago)
     - `end_date`: End date (default: now)
   - Returns aggregated statistics

5. **Download Data as CSV**
   - `GET /api/download/:table`
   - Parameters:
     - `location`: Filter by location
     - `start_date`: Start date filter
     - `end_date`: End date filter
     - `columns`: Comma-separated column names
   - Returns CSV file download

6. **Health Check**
   - `GET /health`
   - Returns server and database connection status

## Example API Calls

### Get all locations
```bash
curl http://localhost:3001/api/locations
```

### Get temperature data for a specific location
```bash
curl "http://localhost:3001/api/data/table1?location=MountMansfield&limit=100"
```

### Get wind data for date range
```bash
curl "http://localhost:3001/api/data/Wind?start_date=2024-01-01&end_date=2024-01-31"
```

### Download precipitation data as CSV
```bash
curl -o precipitation.csv "http://localhost:3001/api/download/Precipitation?location=Burlington&start_date=2024-01-01"
```

### Get analytics summary
```bash
curl "http://localhost:3001/api/analytics?location=MountMansfield"
```

## Switching Databases

To switch to the processed database, update the `.env` file:
```env
MYSQL_DATABASE=CRRELS2S_VTClimateRepository_Processed
```

Then restart the server.

## Troubleshooting

1. **Database Connection Failed**
   - Verify you're on the UVM network or VPN
   - Check credentials in `.env` file
   - Ensure MySQL port is not blocked

2. **No Data Returned**
   - Check if tables exist in the selected database
   - Verify location names match exactly (case-sensitive)
   - Check date format (use ISO 8601: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)

3. **Server Port Already in Use**
   - Change the PORT in `.env` file
   - Or kill the process using port 3001

## Adding New Tables

To add new tables to the API:

1. Add table name to `allowedTables` array in `server/server.js`
2. Add formatting logic in `formatTableData()` function
3. Update analytics queries if needed
4. Restart the server