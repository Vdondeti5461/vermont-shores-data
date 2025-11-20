# UVM Deployment Checklist

## Prerequisites for vdondeti.w3.uvm.edu

### 1. Apache Modules (Required)
Ensure these Apache modules are enabled:
```bash
# Check if modules are enabled
apachectl -M | grep -E '(rewrite|proxy|proxy_http)'

# If not enabled, contact UVM IT to enable:
# - mod_rewrite
# - mod_proxy
# - mod_proxy_http
```

### 2. Backend API Server

**Location:** `~/api/production-api-server.js`

**Start the API server:**
```bash
cd ~/api
node production-api-server.js
```

**Or use PM2 for production:**
```bash
pm2 start production-api-server.js --name crrels2s-api
pm2 save
pm2 startup
```

**Verify it's running:**
```bash
curl http://localhost:3001/health
# Should return: {"status":"healthy","timestamp":"..."}
```

### 3. Frontend Build

**Location:** `~/site-src/dist/`

**Build the frontend:**
```bash
cd ~/site-src
npm run build
```

**Deploy to web root:**
```bash
# Copy dist files to your web directory
cp -r dist/* ~/www-root/
# Or symlink
ln -s ~/site-src/dist ~/www-root
```

### 4. Apache Configuration

**Verify .htaccess is present:**
```bash
ls -la ~/www-root/.htaccess
```

**The .htaccess should contain:**
```apache
RewriteEngine On
RewriteBase /

# Proxy API requests to Node.js backend
RewriteCond %{REQUEST_URI} ^/(health|api)
RewriteRule ^(.*)$ http://127.0.0.1:3001/$1 [P,L]

# Client-side routing for React
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/(health|api)
RewriteRule . /index.html [L]
```

### 5. Backend CORS Configuration

**Update production-api-server.js CORS:**
```javascript
app.use(cors({
  origin: [
    'https://www.uvm.edu',
    'https://crrels2s.w3.uvm.edu',
    'https://vdondeti.w3.uvm.edu',  // ✅ ADD THIS
    'http://localhost:5173'
  ],
  credentials: true
}));
```

### 6. Firewall/Security

The Node.js API (port 3001) should only be accessible from localhost.
Apache proxies requests from the web, so external access to 3001 is not needed.

## Testing the Deployment

### 1. Test Backend Directly (on server)
```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/databases
```

### 2. Test Through Apache (from browser)
Open browser console and check:
```javascript
// Should log: "📡 API Base URL configured: https://vdondeti.w3.uvm.edu"
```

### 3. Test API Endpoints (from browser)
```
https://vdondeti.w3.uvm.edu/health
https://vdondeti.w3.uvm.edu/api/databases
```

### 4. Check Browser Console
Open DevTools → Console and look for:
- `🔧 API Config: UVM deployment detected, using: https://vdondeti.w3.uvm.edu`
- `📡 API Base URL configured: https://vdondeti.w3.uvm.edu`
- `📊 Fetching databases from: https://vdondeti.w3.uvm.edu/api/databases`

### 5. Check Network Tab
Open DevTools → Network and verify:
- API requests go to `https://vdondeti.w3.uvm.edu/api/databases`
- Response status is 200
- Response contains database array

## Troubleshooting

### Issue: "CORS policy" errors
**Solution:** Update backend CORS to include `https://vdondeti.w3.uvm.edu`

### Issue: "net::ERR_CONNECTION_REFUSED"
**Solution:** 
1. Verify backend is running: `pm2 status` or `ps aux | grep node`
2. Check it responds: `curl http://localhost:3001/health`

### Issue: "404 Not Found" for /api requests
**Solution:**
1. Verify .htaccess has proxy rules
2. Check Apache modules are enabled
3. Restart Apache: `apachectl restart`

### Issue: Can't see databases in UI
**Solution:**
1. Open browser console (F12)
2. Check the API base URL logged
3. Check Network tab for failed requests
4. Verify backend returns data: `curl http://localhost:3001/api/databases`

## Directory Structure
```
~/ (home directory)
├── api/                          # Backend API
│   ├── production-api-server.js
│   ├── node_modules/
│   ├── package.json
│   └── server.log
│
├── site-src/                     # Frontend source
│   ├── src/
│   ├── public/
│   ├── dist/                     # Built files
│   └── package.json
│
└── www-root/                     # Web-accessible files
    ├── index.html
    ├── assets/
    ├── .htaccess
    └── ... (all built files from dist/)
```

## Quick Commands

```bash
# Check if API is running
curl http://localhost:3001/health

# Start API with PM2
cd ~/api && pm2 start production-api-server.js --name crrels2s-api

# Rebuild frontend
cd ~/site-src && npm run build

# View API logs
pm2 logs crrels2s-api
# or
tail -f ~/api/server.log

# Restart everything
pm2 restart crrels2s-api
```

## Post-Deployment Verification

Visit: `https://vdondeti.w3.uvm.edu`

Expected behavior:
1. ✅ Homepage loads
2. ✅ Navigation works
3. ✅ Analytics page loads databases
4. ✅ Download page shows database options
5. ✅ No CORS errors in console
6. ✅ API requests succeed in Network tab
