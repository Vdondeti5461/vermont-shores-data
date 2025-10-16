# Complete Production Deployment Guide for crrels2s.w3.uvm.edu

## 🎯 Overview

This guide walks you through deploying the Summit2Shore application to your production server **crrels2s.w3.uvm.edu**, mirroring the existing setup on vdondeti.w3.uvm.edu.

## 📋 Server Information

- **Production Server**: crrels2s.w3.uvm.edu
- **SSH User**: crrels2s
- **Web Root**: ~/www-root
- **API Directory**: ~/www-root/api (to be created)
- **Current Structure**: You already have www-root folder ready

## 🔧 Prerequisites Checklist

Before starting, ensure you have:

- [ ] SSH access to crrels2s@crrels2s.w3.uvm.edu
- [ ] SSH key configured (password-less login recommended)
- [ ] Node.js installed on crrels2s server (v14 or higher)
- [ ] npm installed on crrels2s server
- [ ] PM2 installed globally on crrels2s server
- [ ] Apache web server running
- [ ] MySQL database access (same web5.uvm.edu database)
- [ ] Git repository access (if using version control)

## 🚀 Quick Deployment (Automated)

### Option A: Deploy to Production Only

```bash
# From your local machine where you have the code
./deploy-dual.sh production
```

### Option B: Deploy to Both Servers

```bash
# Deploy to both testing (vdondeti) and production (crrels2s)
./deploy-dual.sh both
```

**Note**: The `deploy-dual.sh` script is already configured with crrels2s.w3.uvm.edu as the production server!

## 📝 Step-by-Step Manual Deployment

Follow these steps if you prefer manual deployment or if automated deployment fails.

---

## PART 1: Backend API Deployment

### Step 1: Connect to Production Server

```bash
ssh crrels2s@crrels2s.w3.uvm.edu
```

### Step 2: Create API Directory

```bash
cd ~/www-root
mkdir -p api
cd api
```

### Step 3: Upload Backend Files

From your **local machine**, upload the backend files:

```bash
# Upload API server file
scp production-api-server.js crrels2s@crrels2s.w3.uvm.edu:~/www-root/api/

# Upload package.json
scp production-package.json crrels2s@crrels2s.w3.uvm.edu:~/www-root/api/package.json
```

### Step 4: Install Backend Dependencies

Back on the **production server**:

```bash
cd ~/www-root/api
npm install
```

Expected output:
```
added 45 packages in 3s
```

### Step 5: Test Backend API Locally

Test that the API server can start:

```bash
node production-api-server.js
```

Expected output:
```
🚀 API Server running on http://localhost:3001
✅ Database connection pool created successfully
```

Press `Ctrl+C` to stop the test server.

Test the health endpoint:

```bash
# In another terminal on the server
curl http://localhost:3001/health
```

Expected response:
```json
{"status":"healthy","timestamp":"2025-10-16T..."}
```

### Step 6: Set Up PM2 for Production

Install PM2 globally if not already installed:

```bash
# Check if PM2 is installed
pm2 --version

# If not installed:
npm install -g pm2
```

Start the API server with PM2:

```bash
cd ~/www-root/api
pm2 start production-api-server.js --name "summit2shore-api"
pm2 save
pm2 startup  # Follow the instructions if prompted
```

Verify PM2 is running:

```bash
pm2 status
pm2 logs summit2shore-api --lines 20
```

### Step 7: Configure PM2 Auto-Start on Reboot

```bash
pm2 startup
# Copy and run the command that PM2 outputs
pm2 save
```

---

## PART 2: Apache Configuration

### Step 8: Configure Apache as Reverse Proxy

Create or edit Apache configuration:

```bash
# Location may vary, common paths:
# ~/.htaccess (in www-root)
# or ask your system admin for the Apache config location
```

Edit `~/www-root/.htaccess`:

```apache
RewriteEngine On
RewriteBase /

# Serve UVM favicon for all routes
RedirectMatch 302 ^/favicon\.ico$ /lovable-uploads/6cc4d90f-0179-494a-a8be-7a9a1c70a0e9.png
RedirectMatch 302 ^/api/favicon\.ico$ /lovable-uploads/6cc4d90f-0179-494a-a8be-7a9a1c70a0e9.png
RedirectMatch 302 ^/health/favicon\.ico$ /lovable-uploads/6cc4d90f-0179-494a-a8be-7a9a1c70a0e9.png

# Proxy API requests to Node.js backend
RewriteCond %{REQUEST_URI} ^/(health|api)
RewriteRule ^(.*)$ http://127.0.0.1:3001/$1 [P,L]

# Client-side routing for React
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/(health|api)
RewriteRule . /index.html [L]
```

### Step 9: Restart Apache (if needed)

```bash
# May require sudo or contact system admin
sudo systemctl restart apache2
# or
sudo systemctl restart httpd
```

---

## PART 3: Frontend Deployment

### Step 10: Build Frontend Locally

On your **local machine** where you have the project:

```bash
# Install dependencies if not already done
npm install

# Build for production
npm run build
```

This creates a `dist/` folder with optimized production files.

### Step 11: Upload Frontend Files

From your **local machine**:

```bash
# Create backup of existing files first
ssh crrels2s@crrels2s.w3.uvm.edu "cp -r ~/www-root ~/backup-www-root-$(date +%F-%H%M%S)"

# Clear existing frontend files (keep API folder)
ssh crrels2s@crrels2s.w3.uvm.edu "cd ~/www-root && find . -maxdepth 1 -not -name 'api' -not -name '.' -not -name '.htaccess' -exec rm -rf {} + 2>/dev/null || true"

# Upload new frontend files
scp -r dist/* crrels2s@crrels2s.w3.uvm.edu:~/www-root/
```

### Step 12: Set Proper Permissions

On the **production server**:

```bash
cd ~/www-root
chmod -R 755 .
```

---

## PART 4: Verification & Testing

### Step 13: Test Backend API Endpoints

From the **production server** or your **local machine**:

```bash
# Health check
curl https://crrels2s.w3.uvm.edu/health

# List databases
curl https://crrels2s.w3.uvm.edu/api/databases

# List tables in a database
curl https://crrels2s.w3.uvm.edu/api/databases/silk/tables

# Get locations
curl https://crrels2s.w3.uvm.edu/api/databases/silk/locations
```

Expected responses should be JSON data without errors.

### Step 14: Test Frontend

Open a browser and visit:
- https://crrels2s.w3.uvm.edu

Check:
- [ ] Homepage loads correctly
- [ ] Navigation works (all menu items)
- [ ] Database dropdown populates (confirms API connection)
- [ ] Data download functionality works
- [ ] Analytics pages load data
- [ ] No console errors (open browser DevTools)

### Step 15: Verify API Integration

1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to Data Download page
4. Check that API requests to `/api/databases` succeed
5. Verify no CORS errors
6. Verify no 404 or 500 errors

---

## 🔄 Database Configuration

The application uses the **same MySQL database** on web5.uvm.edu as the testing server.

### Database Connection Details (in production-api-server.js)

```javascript
host: 'web5.uvm.edu',
user: 'silk',
password: '[same as testing server]',
```

**Important**: No database setup needed on crrels2s server - it connects to the shared database on web5.uvm.edu.

---

## 🛠️ Troubleshooting

### Issue 1: API Not Responding

**Check PM2 status:**
```bash
ssh crrels2s@crrels2s.w3.uvm.edu
pm2 status
pm2 logs summit2shore-api
```

**Restart API if needed:**
```bash
pm2 restart summit2shore-api
```

### Issue 2: Frontend Shows Connection Errors

**Check browser console** for errors related to API calls.

**Verify API URL configuration:**
The frontend automatically detects it's running on crrels2s.w3.uvm.edu and uses that domain for API calls (see `src/lib/apiConfig.ts`).

### Issue 3: Database Connection Failed

**Test database connection from server:**
```bash
ssh crrels2s@crrels2s.w3.uvm.edu
cd ~/www-root/api
node -e "const mysql = require('mysql2'); const conn = mysql.createConnection({host: 'web5.uvm.edu', user: 'silk', password: '[password]'}); conn.connect(err => { if(err) console.error(err); else console.log('Connected'); conn.end(); });"
```

### Issue 4: 404 Errors on Page Refresh

**Verify .htaccess exists** in www-root:
```bash
ssh crrels2s@crrels2s.w3.uvm.edu
cat ~/www-root/.htaccess
```

### Issue 5: Apache Proxy Not Working

**Check Apache modules** are enabled:
```bash
# May need sudo or system admin
apache2ctl -M | grep proxy
# Should show: proxy_module, proxy_http_module
```

### Issue 6: PM2 Doesn't Start on Reboot

**Re-run PM2 startup:**
```bash
pm2 unstartup
pm2 startup
# Run the command it outputs
pm2 save
```

---

## 🔐 Security Checklist

- [ ] Database credentials are not exposed in frontend code
- [ ] API only accessible through Apache reverse proxy
- [ ] CORS configured properly in production-api-server.js
- [ ] File permissions set correctly (755 for directories, 644 for files)
- [ ] PM2 running as non-root user (crrels2s)
- [ ] .htaccess properly restricts direct access to API files
- [ ] No development URLs (localhost:3001) in production bundle

---

## 📊 Monitoring Commands

### Check Frontend
```bash
curl -I https://crrels2s.w3.uvm.edu
```

### Check Backend API
```bash
curl https://crrels2s.w3.uvm.edu/health
pm2 status
pm2 logs summit2shore-api --lines 50
```

### Check Disk Space
```bash
ssh crrels2s@crrels2s.w3.uvm.edu
df -h ~/www-root
```

### Check Recent Logs
```bash
ssh crrels2s@crrels2s.w3.uvm.edu
pm2 logs summit2shore-api --lines 100 --nostream
```

---

## 🔄 Update Deployment

When you make code changes and need to redeploy:

### Quick Update (Frontend Only)
```bash
# Local machine
npm run build
./deploy-dual.sh production
```

### Backend Update
```bash
# Upload updated API file
scp production-api-server.js crrels2s@crrels2s.w3.uvm.edu:~/www-root/api/

# Restart API
ssh crrels2s@crrels2s.w3.uvm.edu "pm2 restart summit2shore-api"
```

### Full Update (Frontend + Backend)
```bash
# Build locally
npm run build

# Deploy frontend
./deploy-dual.sh production

# Update backend
scp production-api-server.js crrels2s@crrels2s.w3.uvm.edu:~/www-root/api/
ssh crrels2s@crrels2s.w3.uvm.edu "pm2 restart summit2shore-api"
```

---

## 📁 Directory Structure on Production Server

After successful deployment:

```
~/
├── www-root/                    # Web root (Apache serves from here)
│   ├── index.html              # Main frontend entry point
│   ├── assets/                 # JS, CSS, images bundled by Vite
│   ├── lovable-uploads/        # Uploaded images/assets
│   ├── .htaccess               # Apache rewrite rules
│   └── api/                    # Backend API
│       ├── production-api-server.js
│       ├── package.json
│       └── node_modules/
├── backup-www-root-YYYY-MM-DD-HHMMSS/  # Timestamped backups
└── [other files]
```

---

## 🎯 Success Criteria

Your deployment is successful when:

✅ Frontend loads at https://crrels2s.w3.uvm.edu  
✅ All navigation works without errors  
✅ Database dropdown populates with data  
✅ Data download functionality works  
✅ Analytics pages display charts and data  
✅ Browser console shows no errors  
✅ API health check responds: `curl https://crrels2s.w3.uvm.edu/health`  
✅ PM2 shows API running: `pm2 status`  
✅ No localhost URLs found in production bundle  

---

## 🔗 Related Documentation

- [COMPREHENSIVE_HOSTING_GUIDE.md](./COMPREHENSIVE_HOSTING_GUIDE.md) - Detailed hosting architecture
- [DUAL_DEPLOYMENT_GUIDE.md](./DUAL_DEPLOYMENT_GUIDE.md) - Automated dual deployment
- [deploy-dual.sh](./deploy-dual.sh) - Automated deployment script
- [production-api-server.js](./production-api-server.js) - Backend API implementation

---

## 📞 Quick Reference Commands

```bash
# Deploy to production only
./deploy-dual.sh production

# Deploy to both servers
./deploy-dual.sh both

# Check API status
ssh crrels2s@crrels2s.w3.uvm.edu "pm2 status"

# View API logs
ssh crrels2s@crrels2s.w3.uvm.edu "pm2 logs summit2shore-api"

# Restart API
ssh crrels2s@crrels2s.w3.uvm.edu "pm2 restart summit2shore-api"

# Test production site
curl -I https://crrels2s.w3.uvm.edu
curl https://crrels2s.w3.uvm.edu/health

# View backups
ssh crrels2s@crrels2s.w3.uvm.edu "ls -la ~/backup-www-root-*"
```

---

## 🎉 Congratulations!

You now have Summit2Shore running on both:
- **Testing**: https://vdondeti.w3.uvm.edu
- **Production**: https://crrels2s.w3.uvm.edu

Both servers share the same MySQL database on web5.uvm.edu and use identical API and frontend code.
