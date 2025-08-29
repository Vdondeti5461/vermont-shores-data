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
- Production: `https://your-silk-domain.com/api`
- All responses return JSON

### Core Endpoints

#### `GET /api/databases`
Get all available databases
```json
{
  "databases": [
    {
      "key": "raw_data",
      "name": "CRRELS2S_VTClimateRepository", 
      "displayName": "Raw Data"
    }
  ]
}
```

#### `GET /api/databases/{database}/locations`
Get monitoring locations
```bash
curl "https://your-domain.com/api/databases/raw_data/locations"
```

#### `GET /api/databases/{database}/tables`
List tables in database
```bash
curl "https://your-domain.com/api/databases/raw_data/tables"
```

#### `GET /api/databases/{database}/data/{table}`
Get filtered environmental data
```bash
# Get temperature data for specific station
curl "https://your-domain.com/api/databases/raw_data/data/table1?location=Station_001&start_date=2024-01-01&attributes=TIMESTAMP,AirTC_Avg"
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
curl -o data.csv "https://your-domain.com/api/databases/raw_data/download/table1?start_date=2024-01-01"
```

## JavaScript Usage Examples

```javascript
// Fetch all locations
const locations = await fetch('/api/databases/raw_data/locations')
  .then(r => r.json());

// Get filtered temperature data
const params = new URLSearchParams({
  location: 'Station_001',
  start_date: '2024-01-01T00:00:00Z',
  attributes: 'TIMESTAMP,AirTC_Avg,RH'
});

const data = await fetch(`/api/databases/raw_data/data/table1?${params}`)
  .then(r => r.json());

// Download CSV
const downloadUrl = `/api/databases/raw_data/download/table1?${params}`;
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
  origin: ['https://your-silk-domain.com'],
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
curl https://your-domain.com/health
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