# Summit2Shore Project Structure

## Overview
This project uses a dual-server deployment strategy:
- **Testing Server**: `vdondeti.w3.uvm.edu`
- **Production Server**: `crrels2s.w3.uvm.edu`

## Repository Structure (GitHub)

```
summit2shore/
├── src/                          # Frontend React source code
├── public/                       # Static assets
├── docs/                         # Project documentation
├── supabase/                     # Supabase configuration
├── production-api-server.js      # Backend API server source
├── production-package.json       # Backend dependencies
├── deploy.sh                     # Single server deployment script
├── deploy-dual.sh                # Dual server deployment script
├── package.json                  # Frontend dependencies
├── vite.config.ts               # Vite configuration
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
└── Documentation files          # *.md files
```

### What's NOT in GitHub
- `node_modules/` - Dependencies (install via npm)
- `dist/` - Build output (generated during deployment)
- `*.log` - Server logs
- `.env` - Environment variables
- `backup*/` - Server backups
- `www-root/` - Deployment target (server-specific)

## Server Directory Structure

### Testing Server: vdondeti.w3.uvm.edu
```
/users/v/d/vdondeti/
├── site-src/                    # Source code from GitHub
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── production-api-server.js
│   └── [all source files]
│
├── api/                         # Backend deployment
│   ├── production-api-server.js # Deployed backend
│   ├── package.json             # Backend deps
│   ├── node_modules/            # Installed deps
│   └── server.log               # Runtime logs
│
└── www-root/                    # Frontend deployment (Apache serves from here)
    ├── index.html               # Built frontend
    ├── assets/                  # Built JS/CSS
    ├── .htaccess                # Apache config
    └── [all built files]
```

### Production Server: crrels2s.w3.uvm.edu
```
/users/c/r/crrels2s/
├── site-src/                    # Source code from GitHub
├── api/                         # Backend deployment
└── www-root/                    # Frontend deployment
```

## Deployment Workflow

### 1. GitHub → Server
```bash
# Source code lives in ~/site-src/
cd ~/site-src
git pull origin main
```

### 2. Build Frontend
```bash
cd ~/site-src
npm install
npm run build
# Creates ~/site-src/dist/
```

### 3. Deploy Frontend
```bash
# Copy built files to www-root
cp -r ~/site-src/dist/* ~/www-root/
```

### 4. Deploy Backend
```bash
# Copy API server to ~/api/
cp ~/site-src/production-api-server.js ~/api/
cp ~/site-src/production-package.json ~/api/package.json
cd ~/api
npm install
pm2 restart crrels2s-api
```

## Automated Deployment

### Using deploy-dual.sh (from local machine)
```bash
# Deploy to both servers
./deploy-dual.sh

# Deploy to testing only
./deploy-dual.sh testing

# Deploy to production only
./deploy-dual.sh production
```

### Manual Deployment (on server)
```bash
# On vdondeti.w3.uvm.edu
cd ~/site-src
git pull
npm run build
cp -r dist/* ~/www-root/
cd ~/api
pm2 restart crrels2s-api
```

## File Responsibilities

### In GitHub (Source Control)
- All source code (`src/`, `public/`)
- Configuration files (`*.config.ts`, `*.json`)
- Deployment scripts (`deploy*.sh`)
- Documentation (`*.md`)
- Backend source (`production-api-server.js`)

### On Server Only (Not in GitHub)
- Build outputs (`dist/`, `www-root/`)
- Dependencies (`node_modules/`)
- Logs (`*.log`, `*.pid`)
- Environment files (`.env`)
- Backups (`backup*/`)

### Apache Configuration
- `.htaccess` in `www-root/` for:
  - API proxying to Node.js backend
  - Client-side routing for React
  - Favicon handling

## Database
Both servers connect to the same MySQL database:
- Host: `webdb5.uvm.edu`
- Databases: `CRRELS2S_*`

## CI/CD Considerations

### Current Setup (Manual)
1. Push code to GitHub
2. SSH to server
3. Pull latest code
4. Build and deploy

### Future CI/CD Options
1. **GitHub Actions**:
   - Trigger on push to main
   - Build frontend
   - Deploy via SSH to servers
   
2. **Post-receive Git Hook**:
   - Automatic deployment on git push
   - Server-side build and deployment

3. **Automated Script**:
   - Cron job to check for updates
   - Auto-deploy on changes

## URLs

### Testing Environment
- Frontend: `https://vdondeti.w3.uvm.edu`
- API Health: `https://vdondeti.w3.uvm.edu/health`
- API Endpoints: `https://vdondeti.w3.uvm.edu/api/*`

### Production Environment
- Frontend: `https://crrels2s.w3.uvm.edu`
- API Health: `https://crrels2s.w3.uvm.edu/health`
- API Endpoints: `https://crrels2s.w3.uvm.edu/api/*`

## Best Practices

1. **Always test on vdondeti.w3.uvm.edu first**
2. **Backup before deploying** (automatic in deploy scripts)
3. **Check logs after deployment**
4. **Verify health endpoint** after backend restart
5. **Test frontend in browser** after deployment
6. **Keep GitHub repo clean** (no build outputs or logs)
