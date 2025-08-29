# UVM Server Deployment Guide

## Current Issue
Your frontend at `vdondeti.w3.uvm.edu` is getting HTML instead of JSON because there's no backend API server running. You need to deploy your backend server to handle API requests.

## Deployment Options

### Option 1: Backend on Same Server (Recommended)
Deploy your Node.js backend server on the same UVM server.

#### Step 1: Upload Backend Files
```bash
# On your UVM server, create backend directory
mkdir -p /var/www/vdondeti/api
cd /var/www/vdondeti/api

# Upload your server files (server.js, package.json, .env)
# Copy from your local 'server' directory
```

#### Step 2: Install Dependencies & Configure
```bash
# Install Node.js dependencies
npm install

# Update your .env file with production database credentials
nano .env
```

**Production .env file:**
```env
# MySQL Database Configuration
MYSQL_HOST=webdb5.uvm.edu
MYSQL_USER=crrels2s_admin
MYSQL_PASSWORD=y0m5dxldXSLP
MYSQL_DATABASE=CRRELS2S_VTClimateRepository
MYSQL_PORT=3306

# Server Configuration
PORT=3001

# CORS Configuration for production
CORS_ORIGIN=https://vdondeti.w3.uvm.edu
```

#### Step 3: Start Backend Server
```bash
# Test the server first
node server.js

# If working, set up as a service using PM2
npm install -g pm2
pm2 start server.js --name "summit2shore-api"
pm2 startup
pm2 save
```

#### Step 4: Configure Apache/Nginx Reverse Proxy
Add this to your Apache virtual host config:

```apache
<VirtualHost *:443>
    ServerName vdondeti.w3.uvm.edu
    DocumentRoot /var/www/vdondeti/html
    
    # Serve static files
    <Directory "/var/www/vdondeti/html">
        AllowOverride All
        Require all granted
    </Directory>
    
    # Proxy API requests to Node.js backend
    ProxyPreserveHost On
    ProxyPass /api/ http://localhost:3001/api/
    ProxyPassReverse /api/ http://localhost:3001/api/
    
    # Health check endpoint
    ProxyPass /health http://localhost:3001/health
    ProxyPassReverse /health http://localhost:3001/health
    
    # SSL Configuration (if available)
    SSLEngine on
    # Add your SSL certificate paths
</VirtualHost>
```

### Option 2: Different Backend Server
If you have a separate server for the backend:

```javascript
// Update src/lib/apiConfig.ts line 28:
return 'https://your-backend-server.uvm.edu';
```

## Testing Your Deployment

### 1. Test Backend Health
```bash
# Direct backend test
curl http://localhost:3001/health

# Through reverse proxy
curl https://vdondeti.w3.uvm.edu/health
```

### 2. Test API Endpoints
```bash
# Test databases endpoint
curl https://vdondeti.w3.uvm.edu/api/databases

# Should return JSON, not HTML
```

### 3. Frontend Integration
1. Rebuild and redeploy your frontend
2. Visit `https://vdondeti.w3.uvm.edu`
3. Check browser console - no more "localhost:3001" errors
4. Data Download section should load databases

## Quick Fix for Current Setup

If Option A (port 3001) doesn't work due to firewall restrictions, update the API config:

```javascript
// In src/lib/apiConfig.ts, change line 25 to:
return w.location.origin; // This will use reverse proxy approach
```

Then ensure your web server proxies `/api/*` requests to your backend.

## Troubleshooting

### Issue: Port 3001 blocked by firewall
**Solution:** Use reverse proxy (Option C in code) and configure your web server to proxy API requests.

### Issue: Database connection fails
**Solution:** Check your .env file has correct production database credentials and the database server allows connections from your UVM server.

### Issue: CORS errors
**Solution:** Add your domain to CORS_ORIGIN in your .env file:
```env
CORS_ORIGIN=https://vdondeti.w3.uvm.edu
```

### Issue: Still getting HTML instead of JSON
**Solution:** Check that your web server is properly proxying `/api/` requests to your backend server.

## Next Steps

1. Choose your preferred deployment option
2. Deploy backend server to UVM infrastructure  
3. Configure reverse proxy in Apache/Nginx
4. Test API endpoints return JSON (not HTML)
5. Redeploy frontend with updated configuration

Your frontend will then automatically detect it's on `uvm.edu` and use the correct API base URL without requiring `npm run dev`.