# 🚀 Local Development Setup with MySQL Database

This guide will help you set up your cloned repository to work with your local MySQL database containing environmental monitoring data.

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ Node.js (v16 or higher)
- ✅ MySQL database with your environmental data tables
- ✅ Git (repository already cloned)

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 2. Configure Database Connection

1. **Create environment file:**
```bash
cd server
cp .env.example .env
```

2. **Edit `server/.env` with your MySQL credentials:**
```env
MYSQL_HOST=your_mysql_host
MYSQL_USER=your_mysql_username
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=summit2shore
MYSQL_PORT=3306
PORT=3001
```

### 3. Update Frontend to Use Local Database

In your components, replace the analytics service import:

```typescript
// OLD - Mock data service
import { useAnalyticsData } from '@/hooks/useAnalyticsData';

// NEW - Local database service
import { useLocalEnvironmentalAnalytics } from '@/hooks/useLocalDatabase';
```

### 4. Start Development Servers

**Terminal 1 - Start API Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```

Your application will be available at:
- 🌐 **Frontend:** http://localhost:5173
- 🔌 **API Server:** http://localhost:3001
- ❤️ **Health Check:** http://localhost:3001/health

## 📡 API Endpoints

The local server provides these endpoints for your environmental data:

### Core Endpoints
- `GET /api/locations` - Get all monitoring locations
- `GET /api/data/:table` - Get data from specific table
- `GET /api/analytics` - Get analytics summary
- `GET /health` - Server health check

### Supported Tables
Based on your schema, these tables are supported:
- `temperature_data` - Temperature and environmental measurements
- `wind_data` - Wind speed and direction data
- `precipitation_data` - Precipitation measurements
- `snow_data` - Snow water equivalent and related data

### Query Parameters
All data endpoints support:
- `location_id` - Filter by specific location
- `start_date` - Filter from start date (ISO format)
- `end_date` - Filter to end date (ISO format)
- `limit` - Limit number of records (default: 1000)

**Example requests:**
```bash
# Get temperature data for specific location
GET /api/data/temperature_data?location_id=Station1&limit=500

# Get analytics for all locations
GET /api/analytics

# Get wind data for date range
GET /api/data/wind_data?start_date=2024-01-01&end_date=2024-01-31
```

## 🔄 Using the Local Database in Your App

### 1. Basic Location and Analytics Data

```typescript
import { useLocalEnvironmentalAnalytics } from '@/hooks/useLocalDatabase';

function MyComponent() {
  const { 
    locations, 
    analytics, 
    environmentalData,
    isLoading,
    isServerHealthy 
  } = useLocalEnvironmentalAnalytics();

  if (!isServerHealthy) {
    return <div>Server connection failed. Please check your local API server.</div>;
  }

  return (
    <div>
      <h2>Locations: {locations.length}</h2>
      <h3>Current Temperature: {analytics.current_metrics.temperature?.avg_temp}°C</h3>
      {/* Your UI components */}
    </div>
  );
}
```

### 2. Specific Metric Data

```typescript
import { useLocalTemperatureData, useLocalWindData } from '@/hooks/useLocalDatabase';

function EnvironmentalCharts({ locationId }) {
  const { data: temperatureData } = useLocalTemperatureData(locationId);
  const { data: windData } = useLocalWindData(locationId);

  // Use data for charts, tables, etc.
  return (
    <div>
      {/* Your charts using temperatureData and windData */}
    </div>
  );
}
```

## 🐛 Troubleshooting

### Database Connection Issues
1. **Check credentials:** Verify your `.env` file has correct MySQL credentials
2. **Test connection:** Visit http://localhost:3001/health
3. **Check MySQL:** Ensure your MySQL server is running and accessible

### CORS Issues
The server includes CORS middleware for cross-origin requests. If you encounter issues:
1. Ensure the API server is running on port 3001
2. Check browser console for specific CORS errors

### Table Not Found Errors
If you get table not found errors:
1. Verify table names match your MySQL schema exactly
2. Check that your database contains the expected tables
3. Review the `allowedTables` array in `server/server.js`

### Data Mapping Issues
The server automatically maps your table structure to standardized format. If data appears incorrect:
1. Check the `mapTableData` function in `server/server.js`
2. Verify column names match your actual database schema
3. Add console logging to debug data transformation

## 🚀 Production Deployment

For production deployment:

1. **Build the frontend:**
```bash
npm run build
```

2. **Deploy the API server** to your hosting platform (Heroku, DigitalOcean, etc.)

3. **Update the base URL** in `src/services/localDatabaseService.ts`:
```typescript
private static baseUrl = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3001/api' 
  : 'https://your-api-server.com/api';
```

## 📊 Data Structure Mapping

Your MySQL tables are automatically mapped to these standardized formats:

### Temperature Data
- `PTemp` → `temperature`
- `AirTC_Avg` → `air_temperature`
- `RH` → `relative_humidity`
- `SWE` → `snow_water_equivalent`

### Wind Data
- `WS_ms` → `wind_speed`
- `WindDir` → `wind_direction`
- `WS_ms_Max` → `wind_speed_max`

### Precipitation Data
- `Accu_RT_NRT` → `accumulation_rt`
- `Intensity_RT` → `intensity_rt`
- `Bucket_RT` → `bucket_rt`

## 🔄 Switching Between Mock and Real Data

You can easily switch between mock data and real database data:

```typescript
// For local development with real database
import { useLocalEnvironmentalAnalytics } from '@/hooks/useLocalDatabase';

// For demo/mock data
import { useAnalyticsState } from '@/hooks/useAnalyticsData';
```

## 📝 Next Steps

1. Test the connection with your database
2. Verify data is being fetched correctly
3. Update your analytics components to use the new hooks
4. Customize the data mapping if needed
5. Add any additional endpoints for specific requirements

Need help? Check the server logs in your terminal for detailed error messages and debugging information.