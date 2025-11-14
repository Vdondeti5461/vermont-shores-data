# Production API Deployment Guide

## Quick Setup for Silk Server

### 1. API Base URL Configuration
Your app now automatically detects production vs local environments:
- **Production**: Uses same-origin (`https://your-silk-domain.com/api`)
- **Local**: Falls back to `http://localhost:3001/api`

No environment variables needed - it's runtime configured!

### 2. Recommended Production Architecture

```
Silk Server Setup:
├── Frontend (React build) → Port 80/443
├── Backend API (Node.js) → Port 3001  
└── MySQL Database → Port 3306
```

### 3. Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-silk-domain.com;
    
    # Serve React app
    location / {
        root /var/www/summit2shore/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /health {
        proxy_pass http://localhost:3001/health;
    }
}
```

### 4. Production Deployment Steps

```bash
# 1. Build frontend
npm run build

# 2. Deploy to silk server
scp -r dist/ user@silk-server:/var/www/summit2shore/
scp -r server/ user@silk-server:/opt/summit2shore/

# 3. Start backend permanently  
ssh user@silk-server
cd /opt/summit2shore/server
npm install --production
pm2 start server.js --name summit2shore-api
pm2 save
pm2 startup
```

## REST API Endpoints

### Base URL
- Production: `https://crrels2s.w3.uvm.edu/api`
- All responses return JSON

### Core Endpoints

#### `GET /api/databases`
Get all available databases
```json
{
  "databases": [
    {
      "key": "raw_data_ingestion",
      "name": "CRRELS2S_raw_data_ingestion", 
      "displayName": "Raw Data Ingestion",
      "description": "Raw sensor data from field loggers"
    },
    {
      "key": "stage_clean_data",
      "name": "CRRELS2S_stage_clean_data",
      "displayName": "Stage Clean Data",
      "description": "Basic QC filtered data"
    },
    {
      "key": "stage_qaqc_data",
      "name": "CRRELS2S_stage_qaqc_data",
      "displayName": "Stage QAQC Data",
      "description": "Advanced QAQC processed data"
    },
    {
      "key": "seasonal_qaqc_data",
      "name": "CRRELS2S_seasonal_qaqc_data",
      "displayName": "Seasonal QAQC Data",
      "description": "Season-bounded datasets"
    }
  ]
}
```

#### `GET /api/databases/{database}/locations`
Get monitoring locations
```bash
curl "https://crrels2s.w3.uvm.edu/api/databases/raw_data_ingestion/locations"
```

#### `GET /api/databases/{database}/tables`
List tables in database
```bash
curl "https://crrels2s.w3.uvm.edu/api/databases/raw_data_ingestion/tables"
```

#### `GET /api/databases/{database}/data/{table}`
Get filtered environmental data
```bash
# Get core observations for specific station
curl "https://crrels2s.w3.uvm.edu/api/databases/raw_data_ingestion/data/raw_env_core_observations?location=RB01&start_date=2024-01-01&attributes=timestamp,air_temperature_avg_c,snow_depth_cm"

# Get wind observations
curl "https://crrels2s.w3.uvm.edu/api/databases/raw_data_ingestion/data/raw_env_wind_observations?location=SUMM&start_date=2024-01-01"
```

Query parameters:
- `location` - Filter by station name
- `start_date` - ISO date (2024-01-01)  
- `end_date` - ISO date (2024-01-31)
- `attributes` - Comma-separated columns
- `limit` - Max records (default: 1000)

#### `GET /api/databases/{database}/download/{table}`
Download CSV file
```bash
# Download core observations
curl -o core_data.csv "https://crrels2s.w3.uvm.edu/api/databases/raw_data_ingestion/download/raw_env_core_observations?start_date=2024-01-01"

# Download wind observations
curl -o wind_data.csv "https://crrels2s.w3.uvm.edu/api/databases/raw_data_ingestion/download/raw_env_wind_observations?location=RB01"
```

## JavaScript Usage Examples

```javascript
// Fetch all locations
const locations = await fetch('https://crrels2s.w3.uvm.edu/api/databases/raw_data_ingestion/locations')
  .then(r => r.json());

// Get filtered core observations
const params = new URLSearchParams({
  location: 'RB01',
  start_date: '2024-01-01T00:00:00Z',
  attributes: 'timestamp,air_temperature_avg_c,relative_humidity_percent,snow_depth_cm'
});

const data = await fetch(`https://crrels2s.w3.uvm.edu/api/databases/raw_data_ingestion/data/raw_env_core_observations?${params}`)
  .then(r => r.json());

// Get wind observations
const windData = await fetch('https://crrels2s.w3.uvm.edu/api/databases/raw_data_ingestion/data/raw_env_wind_observations?location=SUMM')
  .then(r => r.json());

// Download CSV
const downloadUrl = `https://crrels2s.w3.uvm.edu/api/databases/raw_data_ingestion/download/raw_env_core_observations?${params}`;
window.open(downloadUrl);
```

## Security & Performance

### Rate Limiting (Recommended)
```javascript
const rateLimit = require('express-rate-limit');
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per IP
}));
```

### CORS Configuration
```javascript
app.use(cors({
  origin: ['https://crrels2s.w3.uvm.edu'],
  credentials: true
}));
```

### Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_timestamp_location ON table1(TIMESTAMP, Location);
CREATE INDEX idx_location ON table1(Location);
```

## Monitoring

### Health Check
```bash
curl https://crrels2s.w3.uvm.edu/health
# Returns: {"status": "ok", "timestamp": "2024-01-01T00:00:00Z"}
```

### Process Management
```bash
# Check API status
pm2 status summit2shore-api

# View logs
pm2 logs summit2shore-api

# Restart if needed
pm2 restart summit2shore-api
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| API not accessible | Check nginx proxy config |
| Database connection failed | Verify MySQL credentials |
| CORS errors | Update allowed origins |
| Slow queries | Add database indexes |

The frontend now automatically detects your production environment - no configuration needed!