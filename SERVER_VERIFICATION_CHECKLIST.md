# Server Verification Checklist for vdondeti.w3.uvm.edu

This checklist will help you verify all components are correctly configured for the data download feature.

## 1. Verify Backend API Server

```bash
# Check if the API server is running
pm2 list

# Should see 'crrels2s-api' or similar process running
# If not running, start it:
cd ~/api
pm2 start production-api-server.js --name crrels2s-api

# Check backend logs
pm2 logs crrels2s-api --lines 50

# Or check the log file directly
tail -f ~/api/server.log
```

## 2. Test Backend Endpoints Directly

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test databases endpoint
curl http://localhost:3001/api/databases

# Test specific database tables
curl http://localhost:3001/api/databases/seasonal_qaqc_data/tables

# Test locations for a specific table (replace TABLE_NAME with actual table name from previous response)
curl "http://localhost:3001/api/databases/seasonal_qaqc_data/tables/TABLE_NAME/locations"
```

## 3. Verify Apache Configuration

```bash
# Check if .htaccess exists in www-root
ls -la ~/www-root/.htaccess

# View the .htaccess content
cat ~/www-root/.htaccess
```

The `.htaccess` file should contain:
```apache
RewriteEngine On
RewriteBase /

# Serve UVM favicon
RedirectMatch 302 ^/favicon\.ico$ /images/favicon.png

# Proxy API requests to Node.js backend on port 3001
RewriteCond %{REQUEST_URI} ^/(health|api)
RewriteRule ^(.*)$ http://127.0.0.1:3001/$1 [P,L]

# Client-side routing for React
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/(health|api)
RewriteRule . /index.html [L]
```

## 4. Verify Apache Proxy Modules

```bash
# Check if mod_proxy and mod_proxy_http are enabled
apachectl -M | grep proxy

# You should see:
# proxy_module (shared)
# proxy_http_module (shared)
```

If modules are missing, contact UVM IT to enable them.

## 5. Test Frontend Build

```bash
# Navigate to frontend source
cd ~/site-src

# Rebuild frontend with latest changes
npm run build

# Copy to www-root
cp -r dist/* ~/www-root/

# Verify files copied
ls -la ~/www-root/
```

## 6. Test API Endpoints Through Apache

Open browser and test:
1. https://vdondeti.w3.uvm.edu/health
2. https://vdondeti.w3.uvm.edu/api/databases
3. https://vdondeti.w3.uvm.edu/api/databases/seasonal_qaqc_data/tables

## 7. Check Browser Console

1. Open https://vdondeti.w3.uvm.edu in browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Look for these messages:
   - `🔧 API Config: UVM deployment detected, using: https://vdondeti.w3.uvm.edu`
   - `📡 API Base URL configured: https://vdondeti.w3.uvm.edu`
   - `🔍 Initializing data download with API_BASE_URL: https://vdondeti.w3.uvm.edu`
   - `📋 Fetching tables from: https://vdondeti.w3.uvm.edu/api/databases/seasonal_qaqc_data/tables`

5. Go to Network tab
6. Look for API requests and their status codes
7. Check for any CORS errors or 404s

## 8. Common Issues and Solutions

### Issue: API requests return 404
**Solution:** 
- Verify .htaccess proxy rules are correct
- Check Apache error logs: `tail -f /var/log/httpd/error_log` (path may vary)
- Ensure mod_proxy is enabled

### Issue: CORS errors
**Solution:**
- Verify `~/api/production-api-server.js` includes `https://vdondeti.w3.uvm.edu` in CORS origins
- Restart backend: `pm2 restart crrels2s-api`

### Issue: Backend not responding
**Solution:**
```bash
# Check if port 3001 is in use
netstat -tlnp | grep 3001

# If nothing shown, backend isn't running - start it
cd ~/api
pm2 start production-api-server.js --name crrels2s-api

# Check logs for errors
pm2 logs crrels2s-api
```

### Issue: "Loading..." indefinitely
**Solution:**
- Check browser console for errors
- Verify API_BASE_URL in console logs
- Test backend endpoints directly (see step 2)
- Check network tab for failed requests

## 9. Database Connection Test

```bash
# Test MySQL connection from command line
mysql -h webdb5.uvm.edu -u crrels2s_admin -p

# Once connected, verify databases exist
SHOW DATABASES LIKE 'CRRELS2S%';

# Should show:
# CRRELS2S_raw_data_ingestion
# CRRELS2S_stage_clean_data
# CRRELS2S_stage_qaqc_data
# CRRELS2S_seasonal_qaqc_data
```

## 10. File Locations Summary

| Component | Location | Purpose |
|-----------|----------|---------|
| Frontend Source | `~/site-src/` | React application source code |
| Frontend Build | `~/www-root/` | Built files served by Apache |
| Backend API | `~/api/production-api-server.js` | Node.js API server |
| Backend Logs | `~/api/server.log` | API server logs |
| Apache Config | `~/www-root/.htaccess` | Apache rewrite and proxy rules |

## Need Help?

If issues persist after following this checklist:
1. Share the output of browser console logs
2. Share the output of `pm2 logs crrels2s-api --lines 50`
3. Share the output of curl commands from step 2
4. Check Apache error logs if available
