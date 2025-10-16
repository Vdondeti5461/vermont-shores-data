# Complete From-Scratch Deployment Guide for crrels2s.w3.uvm.edu

## 🎯 Overview

This guide walks you through setting up the Summit2Shore application from scratch on `crrels2s.w3.uvm.edu` following the exact production structure from `vdondeti.w3.uvm.edu`.

## 📁 Target Directory Structure

```
~/                                  # Home directory
├── site-src/                       # Source code (Git repository)
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── production-api-server.js
│   ├── production-package.json
│   └── [all source files]
│
├── api/                            # Backend API (production)
│   ├── production-api-server.js
│   ├── package.json
│   ├── node_modules/
│   └── [PM2 files]
│
└── www-root/                       # Frontend build (Apache serves this)
    ├── index.html
    ├── assets/
    ├── lovable-uploads/
    └── .htaccess
```

---

## 🚀 Step-by-Step Deployment

### Step 1: Connect to Production Server

```bash
ssh crrels2s@crrels2s.w3.uvm.edu
```

### Step 2: Create Directory Structure

```bash
cd ~

# Create directories
mkdir -p site-src
mkdir -p api
# www-root already exists

# Verify structure
ls -la
```

Expected output:
```
drwxr-xr-x  2 crrels2s crrels2s  4096 Oct 16 10:00 api
drwxr-xr-x  2 crrels2s crrels2s  4096 Oct 16 10:00 site-src
drwxr-xr-x  2 crrels2s crrels2s  4096 Oct 16 10:00 www-root
```

---

## PART 1: Upload Source Code to site-src

### Option A: Using Git (Recommended)

If you have the code in a Git repository:

```bash
cd ~/site-src
git clone <your-repository-url> .
```

### Option B: Upload from Local Machine

From your **local machine** where you have the Lovable project:

```bash
# Navigate to your project directory
cd /path/to/your/summit2shore-project

# Upload entire source to site-src
scp -r ./* crrels2s@crrels2s.w3.uvm.edu:~/site-src/
```

**Important files to upload:**
- `src/` - All React source code
- `public/` - Public assets
- `package.json` - Frontend dependencies
- `vite.config.ts` - Vite configuration
- `tailwind.config.ts` - Tailwind config
- `index.html` - HTML template
- `production-api-server.js` - Backend API
- `production-package.json` - Backend dependencies
- `tsconfig.json` - TypeScript config
- All configuration files

### Step 3: Verify Source Code Upload

```bash
cd ~/site-src
ls -la
```

You should see all your project files including:
- `src/` directory
- `public/` directory
- `package.json`
- `vite.config.ts`
- etc.

---

## PART 2: Set Up Backend API

### Step 4: Copy Backend Files to api Directory

```bash
cd ~/site-src

# Copy backend server file
cp production-api-server.js ~/api/

# Copy and rename package.json for API
cp production-package.json ~/api/package.json
```

### Step 5: Install Backend Dependencies

```bash
cd ~/api

# Install dependencies
npm install

# Verify installation
ls -la node_modules/
```

Expected packages installed:
- express
- mysql2
- cors

### Step 6: Test Backend API

```bash
cd ~/api

# Test run (will show any errors)
node production-api-server.js
```

Expected output:
```
🚀 API Server running on http://localhost:3001
✅ Database connection pool created successfully
```

**If successful, press `Ctrl+C` to stop.**

Test the health endpoint:
```bash
# In another terminal
curl http://localhost:3001/health
```

Expected response:
```json
{"status":"healthy","timestamp":"2025-10-16T..."}
```

### Step 7: Start Backend with PM2

```bash
cd ~/api

# Start with PM2
pm2 start production-api-server.js --name "summit2shore-api"

# Save PM2 configuration
pm2 save

# Setup auto-start on reboot
pm2 startup
# Run the command that PM2 outputs

# Verify it's running
pm2 status
pm2 logs summit2shore-api --lines 20
```

Expected PM2 output:
```
┌─────┬──────────────────────┬─────────┬─────────┬──────┬───────┐
│ id  │ name                 │ mode    │ status  │ cpu  │ memory│
├─────┼──────────────────────┼─────────┼─────────┼──────┼───────┤
│ 0   │ summit2shore-api     │ fork    │ online  │ 0%   │ 45 MB │
└─────┴──────────────────────┴─────────┴─────────┴──────┴───────┘
```

---

## PART 3: Build and Deploy Frontend

### Step 8: Install Frontend Dependencies

```bash
cd ~/site-src

# Install all dependencies
npm install
```

This will install all React, Vite, and other frontend dependencies.

### Step 9: Build Frontend for Production

```bash
cd ~/site-src

# Build production bundle
npm run build
```

This creates a `dist/` directory with optimized production files.

Expected output:
```
vite v5.x.x building for production...
✓ 1234 modules transformed.
dist/index.html                   0.50 kB │ gzip: 0.32 kB
dist/assets/index-abc123.css     45.23 kB │ gzip: 12.34 kB
dist/assets/index-def456.js     234.56 kB │ gzip: 78.90 kB
✓ built in 15.23s
```

### Step 10: Deploy Build to www-root

```bash
cd ~/site-src

# Backup existing www-root (if any)
cp -r ~/www-root ~/backup-www-root-$(date +%F-%H%M%S)

# Clear www-root (keep .htaccess if it exists)
cd ~/www-root
find . -maxdepth 1 -not -name '.' -not -name '.htaccess' -exec rm -rf {} + 2>/dev/null || true

# Copy built files from dist to www-root
cp -r ~/site-src/dist/* ~/www-root/

# Set proper permissions
chmod -R 755 ~/www-root
```

### Step 11: Configure Apache (.htaccess)

Ensure `.htaccess` exists in www-root:

```bash
cd ~/www-root

# Create .htaccess if it doesn't exist
cat > .htaccess << 'EOF'
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
EOF

# Verify .htaccess
cat .htaccess
```

---

## PART 4: Verification & Testing

### Step 12: Verify Directory Structure

```bash
# Check all directories exist
ls -la ~/ | grep -E "site-src|api|www-root"

# Check site-src has source code
ls ~/site-src/

# Check api has backend
ls ~/api/

# Check www-root has built frontend
ls ~/www-root/
```

### Step 13: Test Backend API

```bash
# Test from server
curl http://localhost:3001/health

# Test from external
curl https://crrels2s.w3.uvm.edu/health

# Test database endpoints
curl https://crrels2s.w3.uvm.edu/api/databases
```

### Step 14: Test Frontend

Open browser and visit:
- https://crrels2s.w3.uvm.edu

**Check:**
- [ ] Homepage loads
- [ ] Navigation works
- [ ] Database dropdown populates (confirms API connection)
- [ ] No console errors (F12 DevTools)

---

## 🔄 Future Updates Workflow

After initial setup, use this workflow for updates:

### Update Source Code

```bash
# On server
cd ~/site-src

# If using Git
git pull origin main

# If uploading from local
# From local machine:
# scp -r ./* crrels2s@crrels2s.w3.uvm.edu:~/site-src/
```

### Rebuild and Redeploy Frontend

```bash
cd ~/site-src

# Install any new dependencies
npm install

# Build
npm run build

# Deploy to www-root
cp -r dist/* ~/www-root/
```

### Update Backend (if needed)

```bash
# Copy updated API file
cp ~/site-src/production-api-server.js ~/api/

# Restart API
cd ~/api
pm2 restart summit2shore-api
```

---

## 📋 Quick Reference Commands

### Check System Status

```bash
# Check PM2 processes
pm2 status

# Check API logs
pm2 logs summit2shore-api --lines 50

# Check disk space
df -h ~/

# Check www-root contents
ls -la ~/www-root/
```

### Restart Services

```bash
# Restart backend API
pm2 restart summit2shore-api

# Restart Apache (may need sudo)
sudo systemctl restart apache2
```

### View Logs

```bash
# Backend API logs
pm2 logs summit2shore-api

# Apache error logs (may need sudo)
sudo tail -f /var/log/apache2/error.log
```

---

## 🛠️ Troubleshooting

### Issue: npm install fails

**Check Node.js and npm versions:**
```bash
node --version  # Should be v14+
npm --version   # Should be v6+
```

If not installed, see [INSTALLATION_PREREQUISITES.md](./INSTALLATION_PREREQUISITES.md)

### Issue: Build fails

**Check for errors in console:**
```bash
cd ~/site-src
npm run build 2>&1 | tee build.log
cat build.log
```

### Issue: Frontend doesn't load

**Check www-root contents:**
```bash
ls -la ~/www-root/
# Should have index.html, assets/, etc.
```

**Check .htaccess exists:**
```bash
cat ~/www-root/.htaccess
```

### Issue: API not responding

**Check PM2 status:**
```bash
pm2 status
pm2 logs summit2shore-api
```

**Restart if needed:**
```bash
pm2 restart summit2shore-api
```

### Issue: Database connection failed

**Test database connectivity:**
```bash
cd ~/api
node -e "const mysql = require('mysql2'); const conn = mysql.createConnection({host: 'web5.uvm.edu', user: 'silk', password: 'your-password'}); conn.connect(err => { if(err) console.error(err); else console.log('Connected'); conn.end(); });"
```

---

## ✅ Success Checklist

- [ ] site-src/ directory created with all source code
- [ ] api/ directory created with backend files
- [ ] Backend dependencies installed in ~/api/node_modules/
- [ ] PM2 running summit2shore-api
- [ ] Frontend built successfully (dist/ created)
- [ ] www-root/ contains built files (index.html, assets/, etc.)
- [ ] .htaccess configured in www-root/
- [ ] https://crrels2s.w3.uvm.edu loads successfully
- [ ] API responds at https://crrels2s.w3.uvm.edu/health
- [ ] Database dropdown populates (API working)
- [ ] No console errors in browser

---

## 🎉 You're Done!

Your application is now deployed at:
- **Production URL**: https://crrels2s.w3.uvm.edu
- **API Health**: https://crrels2s.w3.uvm.edu/health

### Directory Summary:
- `~/site-src/` - Source code for development and rebuilding
- `~/api/` - Backend API running via PM2 on port 3001
- `~/www-root/` - Built frontend served by Apache

---

## 📖 Related Documentation

- [INSTALLATION_PREREQUISITES.md](./INSTALLATION_PREREQUISITES.md) - Software installation
- [DEPLOY_TO_PRODUCTION.md](./DEPLOY_TO_PRODUCTION.md) - Detailed deployment guide
- [COMPREHENSIVE_HOSTING_GUIDE.md](./COMPREHENSIVE_HOSTING_GUIDE.md) - Architecture overview
- [deploy-dual.sh](./deploy-dual.sh) - Automated deployment script
