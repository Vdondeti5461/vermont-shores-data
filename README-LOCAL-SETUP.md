# Local Development Setup with MySQL

## Prerequisites

- Node.js (v16 or higher)
- MySQL database with your environmental data
- Git (to clone the repository)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 2. Database Configuration

1. Copy the environment file:
```bash
cd server
cp .env.example .env
```

2. Edit `server/.env` with your MySQL credentials:
```
MYSQL_HOST=your_mysql_host
MYSQL_USER=your_mysql_username
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=summit2shore
MYSQL_PORT=3306
```

### 3. Update Frontend Service

The project includes a local database service (`src/services/localDatabaseService.ts`) that connects to your MySQL backend.

To use it, update your components to import from the local service instead of the mock service:

```typescript
// Replace this import:
import { AnalyticsService } from '@/services/analyticsService';

// With this:
import { LocalDatabaseService } from '@/services/localDatabaseService';
```

### 4. Start the Development Servers

#### Terminal 1 - Backend Server:
```bash
cd server
npm run dev
```

#### Terminal 2 - Frontend Development:
```bash
npm run dev
```

Your application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## API Endpoints

The local server provides these endpoints:

- `GET /api/locations` - Get all monitoring locations
- `GET /api/data/:table` - Get data from specific table (temperature_data, wind_data, precipitation_data, snow_data)
- `GET /api/analytics` - Get analytics summary
- `GET /health` - Health check

### Query Parameters for Data Endpoints:

- `location_id` - Filter by location
- `start_date` - Filter by start date (ISO format)
- `end_date` - Filter by end date (ISO format)
- `limit` - Limit number of records (default: 1000)

Example:
```
GET /api/data/temperature_data?location_id=Station1&start_date=2024-01-01&limit=500
```

## Database Tables Expected

Your MySQL database should have these tables matching your schema:

1. **locations** - Location information
2. **temperature_data** - Temperature measurements
3. **wind_data** - Wind measurements  
4. **precipitation_data** - Precipitation measurements
5. **snow_data** - Snow measurements

## Troubleshooting

1. **Database Connection Issues**: Verify your MySQL credentials in `server/.env`
2. **CORS Issues**: The server includes CORS middleware for cross-origin requests
3. **Port Conflicts**: Change the PORT in `server/.env` if 3001 is already in use

## Production Deployment

For production, you can:

1. Build the frontend: `npm run build`
2. Serve the built files with your preferred web server
3. Deploy the backend server to your hosting platform
4. Update the `baseUrl` in `localDatabaseService.ts` to your production API URL

## Switching Between Local and Supabase

You can easily switch between local database and Supabase by changing the import in your components:

```typescript
// For local development
import { LocalDatabaseService as DataService } from '@/services/localDatabaseService';

// For Supabase integration
import { AnalyticsService as DataService } from '@/services/analyticsService';
```