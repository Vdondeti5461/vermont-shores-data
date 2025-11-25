# CRREL2S Production Deployment Guide

## Server Structure

**Production Server:** `crrels2s.w3.uvm.edu`

```
~/
├── vermont-shores-data/    # Source code repository
├── www-root/               # Frontend deployment (React build)
├── api/                    # Backend deployment (Node.js API)
│   ├── production-api-server.js
│   ├── package.json
│   └── node_modules/
└── backup-*/               # Automatic backups (timestamped)
```

## Quick Start

### One-Command Deployment

From your local machine or on the server:

```bash
cd ~/vermont-shores-data
chmod +x deploy-crrels2s.sh
./deploy-crrels2s.sh
```

This single script handles:
- ✅ Pulling latest code from GitHub
- ✅ Installing dependencies (frontend & backend)
- ✅ Building the React frontend
- ✅ Deploying frontend to `~/www-root/`
- ✅ Deploying backend to `~/api/`
- ✅ Restarting API server with pm2
- ✅ Creating automatic backups
- ✅ Testing API health

## Manual Steps (if needed)

### Frontend Only

```bash
cd ~/vermont-shores-data
npm run build
rm -rf ~/www-root/*
cp -a dist/. ~/www-root/
```

### Backend Only

```bash
cd ~/vermont-shores-data
cp production-api-server.js ~/api/
cp production-package.json ~/api/package.json
cd ~/api
npm install
pm2 restart crrels2s-api
```

## Monitoring & Management

### Check Status

```bash
# API server status
pm2 status

# API logs (real-time)
pm2 logs crrels2s-api

# Recent API logs
tail -50 ~/api/server.log
```

### Test Endpoints

```bash
# Health check
curl https://crrels2s.w3.uvm.edu/health

# API endpoint
curl https://crrels2s.w3.uvm.edu/api/seasonal/tables

# Frontend
curl -I https://crrels2s.w3.uvm.edu
```

### Manage API Server

```bash
# Restart
pm2 restart crrels2s-api

# Stop
pm2 stop crrels2s-api

# Start
pm2 start ~/api/production-api-server.js --name crrels2s-api

# Save configuration
pm2 save
```

## Rollback

If deployment fails, rollback to previous version:

```bash
# List backups
ls -la ~/backup-*

# Rollback frontend (replace with your timestamp)
cp -a ~/backup-frontend-2024-01-15-143022/. ~/www-root/

# Rollback backend (replace with your timestamp)
cp -a ~/backup-api-2024-01-15-143022/. ~/api/
pm2 restart crrels2s-api
```

## Environment Configuration

The application automatically detects it's running on `crrels2s.w3.uvm.edu` and configures:
- API Base URL: `https://crrels2s.w3.uvm.edu`
- Backend Port: `3001` (proxied through Apache)

## Apache Configuration

`.htaccess` in `~/www-root/` handles:
- API requests → proxied to `http://localhost:3001`
- Static files → served directly
- Client-side routing → all other requests to `index.html`

## Database Connection

Backend connects to MySQL using credentials in `.env` file in `~/api/` directory.

## Troubleshooting

### API Not Responding

```bash
# Check if running
pm2 status

# View logs
pm2 logs crrels2s-api

# Restart
pm2 restart crrels2s-api
```

### Frontend 404 Errors

```bash
# Check .htaccess exists
ls -la ~/www-root/.htaccess

# Verify Apache modules
apachectl -M | grep proxy
```

### Database Connection Issues

```bash
# Test MySQL connection
mysql -h mysql.uvm.edu -u crrels2s_vdondeti -p

# Check database exists
mysql -h mysql.uvm.edu -u crrels2s_vdondeti -p -e "SHOW DATABASES;"
```

## URLs

- **Frontend:** https://crrels2s.w3.uvm.edu
- **API Base:** https://crrels2s.w3.uvm.edu/api
- **Health Check:** https://crrels2s.w3.uvm.edu/health

## Support Files

- `deploy-crrels2s.sh` - Main deployment script
- `production-api-server.js` - Backend API server
- `production-package.json` - Backend dependencies
- `SERVER_VERIFICATION_CHECKLIST.md` - Verification steps
- `DATABASE_SETUP.md` - Database configuration
