# 🚀 Quick Start: Deploy to crrels2s.w3.uvm.edu

## Overview

This guide provides the fastest path to deploy Summit2Shore to your production server **crrels2s.w3.uvm.edu**, matching your existing vdondeti.w3.uvm.edu setup.

---

## 📚 Documentation Structure

Follow these guides in order:

1. **[INSTALLATION_PREREQUISITES.md](./INSTALLATION_PREREQUISITES.md)** ⬅️ START HERE
   - Install Node.js, npm, PM2
   - Verify all system requirements
   - Run prerequisites check script

2. **[DEPLOY_TO_PRODUCTION.md](./DEPLOY_TO_PRODUCTION.md)** ⬅️ THEN THIS
   - Complete deployment instructions
   - Backend API setup
   - Frontend deployment
   - Testing and verification

3. **[COMPREHENSIVE_HOSTING_GUIDE.md](./COMPREHENSIVE_HOSTING_GUIDE.md)** ⬅️ REFERENCE
   - Architecture overview
   - How everything connects
   - Troubleshooting

---

## ⚡ Super Quick Deployment (If Prerequisites Met)

If you already have Node.js, npm, and PM2 installed on crrels2s:

### Option 1: Automated (Recommended)

```bash
# From your local machine where you have the code
./deploy-dual.sh production
```

Then manually set up the backend API once:

```bash
# Upload backend files
scp production-api-server.js crrels2s@crrels2s.w3.uvm.edu:~/api/
scp production-package.json crrels2s@crrels2s.w3.uvm.edu:~/api/package.json

# SSH to server and set up
ssh crrels2s@crrels2s.w3.uvm.edu
cd ~/api
npm install
pm2 start production-api-server.js --name "summit2shore-api"
pm2 save
pm2 startup  # Follow instructions
```

### Option 2: Manual Step-by-Step

Follow [DEPLOY_TO_PRODUCTION.md](./DEPLOY_TO_PRODUCTION.md) for complete manual instructions.

---

## 📋 Current Production Structure (vdondeti)

Based on your screenshot, the working structure on vdondeti.w3.uvm.edu is:

```
~/
├── api/                        # Backend API (Node.js + Express)
│   ├── node_modules/          # npm dependencies
│   ├── package.json
│   ├── production-api-server.js
│   ├── server.log             # PM2 logs
│   └── server.pid             # PM2 process
│
└── www-root/                   # Frontend (React + Vite)
    ├── assets/                # Bundled JS/CSS
    ├── index.html
    ├── lovable-uploads/
    ├── favicon.ico
    ├── placeholder.svg
    └── robots.txt
```

**We will replicate this exact structure on crrels2s.**

---

## 🎯 Deployment Goal

Create identical setup on crrels2s:

- **Frontend:** React application at `~/www-root/`
- **Backend:** Node.js API at `~/api/`
- **Database:** Shared MySQL at `web5.uvm.edu` (same as vdondeti)
- **Process Manager:** PM2 keeping API running
- **Web Server:** Apache serving frontend and proxying API

---

## 🔍 Prerequisites Check (2 Minutes)

Before deploying, verify prerequisites on crrels2s server:

```bash
# SSH to production server
ssh crrels2s@crrels2s.w3.uvm.edu

# Quick check
node --version      # Should show v14+ (ideally v18+)
npm --version       # Should show 6+
pm2 --version       # Should show 5+
ls -la ~/www-root   # Should exist
df -h ~             # Should have 1GB+ free

# Test database
mysql -h web5.uvm.edu -u silk -p  # Enter password, should connect
```

**If any command fails**, follow [INSTALLATION_PREREQUISITES.md](./INSTALLATION_PREREQUISITES.md) first.

---

## 📝 Deployment Checklist

### Phase 1: Prerequisites (Do Once)
- [ ] Node.js installed on crrels2s
- [ ] npm installed on crrels2s  
- [ ] PM2 installed globally
- [ ] Apache running with proxy modules
- [ ] MySQL connection to web5.uvm.edu works
- [ ] SSH keys set up (optional but recommended)

### Phase 2: Backend Setup (Do Once)
- [ ] Create `~/api/` directory
- [ ] Upload `production-api-server.js`
- [ ] Upload `production-package.json` (as package.json)
- [ ] Run `npm install`
- [ ] Start with PM2
- [ ] Configure PM2 auto-start
- [ ] Test API endpoints

### Phase 3: Frontend Deployment (Every Update)
- [ ] Build locally: `npm run build`
- [ ] Upload to `~/www-root/`
- [ ] Configure Apache `.htaccess`
- [ ] Set permissions
- [ ] Test in browser

### Phase 4: Verification
- [ ] Frontend loads: https://crrels2s.w3.uvm.edu
- [ ] Navigation works
- [ ] Database dropdown populates
- [ ] API health check works: https://crrels2s.w3.uvm.edu/health
- [ ] No console errors
- [ ] PM2 status shows API running

---

## 🔧 Common First-Time Issues

### Issue: Node.js Not Installed
**Solution:** See [INSTALLATION_PREREQUISITES.md](./INSTALLATION_PREREQUISITES.md#step-2-check-nodejs-installation)

### Issue: Permission Denied for npm install -g pm2
**Solution:** 
```bash
npm install -g pm2 --prefix=$HOME/.npm-global
echo 'export PATH=$HOME/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Issue: Can't Connect to MySQL
**Solution:** Verify credentials and network access from crrels2s to web5.uvm.edu

### Issue: Apache Not Proxying API Requests
**Solution:** Ensure `.htaccess` is in `~/www-root/` with correct rewrite rules

---

## 📞 Quick Commands Reference

```bash
# Deploy (after prerequisites met)
./deploy-dual.sh production

# Check API status
ssh crrels2s@crrels2s.w3.uvm.edu "pm2 status"

# View API logs
ssh crrels2s@crrels2s.w3.uvm.edu "pm2 logs summit2shore-api --lines 50"

# Restart API
ssh crrels2s@crrels2s.w3.uvm.edu "pm2 restart summit2shore-api"

# Test health endpoint
curl https://crrels2s.w3.uvm.edu/health

# Test database API
curl https://crrels2s.w3.uvm.edu/api/databases
```

---

## 🎓 Understanding the System

### How It Works

1. **User visits** https://crrels2s.w3.uvm.edu
2. **Apache serves** React app from `~/www-root/index.html`
3. **React app makes API calls** to `/api/*` endpoints
4. **Apache proxies** `/api/*` requests to `http://localhost:3001`
5. **Node.js backend** (PM2-managed) handles requests
6. **Backend queries** MySQL on web5.uvm.edu
7. **Data returns** to frontend → displays to user

### Files and Their Purpose

| File | Location | Purpose |
|------|----------|---------|
| `production-api-server.js` | `~/api/` | Backend Express server |
| `package.json` | `~/api/` | Backend dependencies |
| `index.html` | `~/www-root/` | Frontend entry point |
| `assets/*` | `~/www-root/assets/` | Bundled JS/CSS |
| `.htaccess` | `~/www-root/` | Apache config |
| PM2 process | Memory | Keeps API running |

---

## ⏱️ Estimated Time

- **Prerequisites (first time):** 10-30 minutes
- **Backend setup (first time):** 5-10 minutes  
- **Frontend deployment (every time):** 2-5 minutes
- **Verification:** 2-3 minutes

**Total first deployment:** ~30-45 minutes  
**Subsequent updates:** ~5 minutes with automation

---

## 🆘 Need Help?

1. Check [INSTALLATION_PREREQUISITES.md](./INSTALLATION_PREREQUISITES.md) for installation issues
2. Check [DEPLOY_TO_PRODUCTION.md](./DEPLOY_TO_PRODUCTION.md) for deployment issues
3. Check [COMPREHENSIVE_HOSTING_GUIDE.md](./COMPREHENSIVE_HOSTING_GUIDE.md) for architecture questions
4. Review troubleshooting sections in each guide
5. Verify your setup matches the vdondeti structure

---

## ✅ Success Indicators

You'll know deployment succeeded when:

✅ `curl https://crrels2s.w3.uvm.edu` returns HTML  
✅ `curl https://crrels2s.w3.uvm.edu/health` returns JSON  
✅ Browser shows app without errors  
✅ Database dropdown shows locations  
✅ `pm2 status` shows `summit2shore-api` online  
✅ No localhost URLs in browser Network tab  

---

## 🎉 Next Steps After Successful Deployment

1. Test all features thoroughly
2. Set up monitoring (PM2 logs, Apache logs)
3. Document any server-specific configurations
4. Plan for future updates (use `./deploy-dual.sh`)
5. Consider setting up automated backups

---

**Start Here:** [INSTALLATION_PREREQUISITES.md](./INSTALLATION_PREREQUISITES.md)

**Good luck with your deployment! 🚀**
