# Deploy API Server to UVM

## Quick Setup (5 Minutes)

### Step 1: Upload Files to Your UVM Server
```bash
# SSH into your UVM server
ssh your-username@vdondeti.w3.uvm.edu

# Create API directory
mkdir -p /var/www/vdondeti/api
cd /var/www/vdondeti/api

# Download the files (or upload via FTP/SCP)
```

Upload these files to `/var/www/vdondeti/api/`:
- `production-api-server.js` (main API server)
- `production-package.json` (rename to `package.json`)

### Step 2: Install Dependencies
```bash
cd /var/www/vdondeti/api

# Install Node.js dependencies
npm install
```

### Step 3: Test the API Server
```bash
# Start the server
node production-api-server.js

# Test in another terminal
curl http://localhost:3001/health
curl http://localhost:3001/api/databases
```

### Step 4: Configure Web Server Proxy
Add this to your Apache configuration:

```apache
# Add to your VirtualHost for vdondeti.w3.uvm.edu
ProxyPreserveHost On
ProxyPass /api/ http://localhost:3001/api/
ProxyPassReverse /api/ http://localhost:3001/api/
ProxyPass /health http://localhost:3001/health
ProxyPassReverse /health http://localhost:3001/health

# Reload Apache
sudo systemctl reload apache2
```

### Step 5: Keep Server Running (Production)
```bash
# Install PM2 for process management
npm install -g pm2

# Start with PM2
pm2 start production-api-server.js --name "summit2shore-api"

# Save PM2 config
pm2 save
pm2 startup
```

## Testing Your Setup

### 1. Test API Endpoints
```bash
# Health check
curl https://vdondeti.w3.uvm.edu/health

# Databases
curl https://vdondeti.w3.uvm.edu/api/databases

# Should return JSON, not HTML
```

### 2. Test Frontend Integration
1. Visit `https://vdondeti.w3.uvm.edu/download`
2. Check browser console - no more connection errors
3. Database dropdown should populate with your databases

## Expected Results

✅ `https://vdondeti.w3.uvm.edu/health` returns: `{"status":"healthy","timestamp":"..."}`

✅ `https://vdondeti.w3.uvm.edu/api/databases` returns: `{"databases":[...],"seasons":[],"tables":[]}`

✅ Frontend loads databases without "Connection Error"

## API Endpoints Created

Your API now provides all endpoints your frontend needs:

- `GET /health` - Health check
- `GET /api/databases` - List all databases  
- `GET /api/databases/:db/tables` - Get tables for database
- `GET /api/databases/:db/tables/:table/attributes` - Get table columns
- `GET /api/databases/:db/locations` - Get monitoring locations
- `GET /api/databases/:db/download/:table` - Download CSV data
- `GET /api/databases/:db/analytics` - Get analytics summary

## Troubleshooting

### Issue: npm install fails
```bash
# Update Node.js if needed
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Issue: Database connection fails
- Check if `webdb5.uvm.edu` is accessible from your server
- Verify database credentials in `production-api-server.js`

### Issue: Apache proxy not working
```bash
# Enable required modules
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo systemctl restart apache2
```

### Issue: Port 3001 already in use
```bash
# Kill existing process
sudo lsof -ti:3001 | xargs sudo kill -9

# Or change PORT in the script
PORT=3002 node production-api-server.js
```

## Success Confirmation

Once deployed correctly, your frontend at `vdondeti.w3.uvm.edu` will:
- Load database list without errors
- Show tables when database selected
- Enable data filtering and downloads
- Display real data from your MySQL database

The "Connection Error" and "Failed to fetch databases" messages will disappear.