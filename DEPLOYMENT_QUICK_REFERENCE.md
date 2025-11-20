# Deployment Quick Reference

## Testing Server: vdondeti.w3.uvm.edu

### Quick Deploy (Automated)
```bash
# From your local machine
./deploy-dual.sh testing
```

### Manual Deploy on Server
```bash
# SSH to testing server
ssh vdondeti@w3.uvm.edu

# Update code
cd ~/site-src
git pull origin main

# Deploy frontend
npm install
npm run build
cp -r dist/* ~/www-root/

# Deploy backend
cp production-api-server.js ~/api/
cp production-package.json ~/api/package.json
cd ~/api
npm install
pm2 restart crrels2s-api

# Verify
curl http://localhost:3001/health
curl https://vdondeti.w3.uvm.edu/health
```

### Verify Testing Deployment
```bash
# Check backend is running
pm2 list
pm2 logs crrels2s-api --lines 20

# Test API directly
curl http://localhost:3001/health
curl http://localhost:3001/api/databases

# Test through Apache
curl https://vdondeti.w3.uvm.edu/health
curl https://vdondeti.w3.uvm.edu/api/databases

# Check frontend
# Open browser: https://vdondeti.w3.uvm.edu
# Open console (F12) and check for errors
```

---

## Production Server: crrels2s.w3.uvm.edu

### Quick Deploy (Automated)
```bash
# From your local machine
./deploy-dual.sh production
```

### Manual Deploy on Server
```bash
# SSH to production server
ssh crrels2s@w3.uvm.edu

# Update code
cd ~/site-src
git pull origin main

# Deploy frontend
npm install
npm run build
cp -r dist/* ~/www-root/

# Deploy backend
cp production-api-server.js ~/api/
cp production-package.json ~/api/package.json
cd ~/api
npm install
pm2 restart crrels2s-api

# Verify
curl http://localhost:3001/health
curl https://crrels2s.w3.uvm.edu/health
```

### Verify Production Deployment
```bash
# Same verification steps as testing
pm2 list
pm2 logs crrels2s-api --lines 20
curl https://crrels2s.w3.uvm.edu/health
curl https://crrels2s.w3.uvm.edu/api/databases
```

---

## Deploy to Both Servers
```bash
# From your local machine
./deploy-dual.sh
```

---

## Common Commands

### Backend Management
```bash
# Start backend
cd ~/api
pm2 start production-api-server.js --name crrels2s-api

# Restart backend
pm2 restart crrels2s-api

# Stop backend
pm2 stop crrels2s-api

# View logs
pm2 logs crrels2s-api

# Monitor
pm2 monit
```

### Frontend Rebuild
```bash
cd ~/site-src
npm run build
rm -rf ~/www-root/*
cp -r dist/* ~/www-root/
```

### Check Status
```bash
# Backend status
pm2 list

# Backend logs
pm2 logs crrels2s-api --lines 50

# API health
curl http://localhost:3001/health

# Apache access logs (if available)
tail -f /var/log/httpd/access_log

# Apache error logs (if available)
tail -f /var/log/httpd/error_log
```

### Rollback
```bash
# Backend rollback (if backup exists)
cd ~/api
pm2 stop crrels2s-api
cp -r ~/backup_api/* ~/api/
pm2 start production-api-server.js --name crrels2s-api

# Frontend rollback (restore from backup)
cd ~
rm -rf ~/www-root/*
cp -r ~/backup-root-[TIMESTAMP]/* ~/www-root/
```

---

## Troubleshooting

### Backend not responding
```bash
# Check if running
pm2 list

# Check port
netstat -tlnp | grep 3001

# Restart
pm2 restart crrels2s-api

# Check logs
pm2 logs crrels2s-api --lines 100
```

### Frontend not loading
```bash
# Check files exist
ls -la ~/www-root/

# Check .htaccess
cat ~/www-root/.htaccess

# Rebuild and redeploy
cd ~/site-src
npm run build
cp -r dist/* ~/www-root/
```

### API requests failing
```bash
# Test backend directly
curl http://localhost:3001/health
curl http://localhost:3001/api/databases

# Test through Apache
curl https://vdondeti.w3.uvm.edu/health
curl https://vdondeti.w3.uvm.edu/api/databases

# Check CORS in production-api-server.js
grep -A 5 "cors({" ~/api/production-api-server.js

# Should include your domain:
# origin: [
#   'https://vdondeti.w3.uvm.edu',
#   ...
# ]
```

---

## File Locations

### Testing Server (vdondeti.w3.uvm.edu)
- Source: `~/site-src/`
- Backend: `~/api/`
- Frontend: `~/www-root/`
- Logs: `~/api/server.log`

### Production Server (crrels2s.w3.uvm.edu)
- Source: `~/site-src/`
- Backend: `~/api/`
- Frontend: `~/www-root/`
- Logs: `~/api/server.log`

---

## Workflow Summary

1. **Develop** → Push to GitHub
2. **Test** → Deploy to `vdondeti.w3.uvm.edu`
3. **Verify** → Check testing environment
4. **Release** → Deploy to `crrels2s.w3.uvm.edu`
5. **Monitor** → Check logs and health endpoints
