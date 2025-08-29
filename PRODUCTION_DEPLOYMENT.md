# Production Deployment Guide for Silk Server

## Quick Update Script (Run this every time you want to deploy)

```bash
#!/bin/bash
# Save this as ~/deploy.sh and run: chmod +x ~/deploy.sh

cd ~/site-src

echo "🔄 Pulling latest changes from GitHub..."
git pull origin main

echo "📦 Installing/updating dependencies..."
npm ci

echo "🏗️  Building production bundle..."
npm run build

echo "💾 Backing up current site..."
ts=$(date +%F-%H%M%S)
cp -r ~/www-root ~/backup-root-$ts

echo "🚀 Deploying to production..."
rm -rf ~/www-root/* ~/www-root/.[!.]* ~/www-root/..?* 2>/dev/null || true
cp -a dist/. ~/www-root/

echo "✅ Deployment complete!"
echo "🌐 Live at: https://www.uvm.edu/~vdondeti"
echo "📁 Backup saved: ~/backup-root-$ts"
```

## Step-by-Step Manual Process

### 1. Pull Latest Changes
```bash
cd ~/site-src
git pull origin main
```

### 2. Install Dependencies (if package.json changed)
```bash
npm ci
```

### 3. Build Production Bundle
```bash
npm run build
```

### 4. Deploy to Production
```bash
# Backup current site
ts=$(date +%F-%H%M%S)
cp -r ~/www-root ~/backup-root-$ts

# Deploy new build
rm -rf ~/www-root/* ~/www-root/.[!.]* ~/www-root/..?* 2>/dev/null || true
cp -a dist/. ~/www-root/
```

## Backend API Changes

Since Silk can't run Node.js, your backend API needs to run elsewhere. Here's how to handle backend updates:

### Option 1: External API Server
If running backend on another server (recommended):

1. **Update API server:**
   ```bash
   # On your API server
   cd /path/to/your/api
   git pull origin main
   npm ci
   pm2 restart your-api-name
   ```

2. **Update frontend API URL:**
   ```bash
   cd ~/site-src
   echo 'VITE_API_URL=https://your-api-server.com/' > .env.production
   npm run build
   cp -a dist/. ~/www-root/
   ```

### Option 2: UVM Server for Backend
If UVM provides Node.js hosting, deploy backend there:

1. **Upload backend files:**
   ```bash
   cd ~/site-src/server
   # Copy server files to your Node.js hosting location
   ```

2. **Update frontend to point to UVM backend:**
   ```bash
   cd ~/site-src
   echo 'VITE_API_URL=https://your-uvm-backend-url/' > .env.production
   npm run build
   cp -a dist/. ~/www-root/
   ```

## Automated Deployment Setup

### Create Deploy Script
```bash
# Create the script
cat > ~/deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Starting deployment..."
cd ~/site-src

# Pull latest
echo "🔄 Pulling from GitHub..."
git pull origin main

# Check if package.json changed
if git diff HEAD~1 HEAD --name-only | grep -q package.json; then
    echo "📦 Package.json changed, running npm ci..."
    npm ci
fi

# Build
echo "🏗️  Building..."
npm run build

# Backup and deploy
echo "💾 Backing up and deploying..."
ts=$(date +%F-%H%M%S)
cp -r ~/www-root ~/backup-root-$ts 2>/dev/null || true
rm -rf ~/www-root/* ~/www-root/.[!.]* ~/www-root/..?* 2>/dev/null || true
cp -a dist/. ~/www-root/

echo "✅ Deployment complete!"
echo "🌐 Live at: https://www.uvm.edu/~vdondeti"
echo "📁 Backup: ~/backup-root-$ts"
EOF

chmod +x ~/deploy.sh
```

### Run Deployment
```bash
~/deploy.sh
```

## Rollback Process

If something goes wrong:
```bash
# List available backups
ls -la ~/backup-root-*

# Rollback to previous version
cp -a ~/backup-root-2025-08-27-163045/. ~/www-root/
```

## Monitoring and Logs

### Check Deployment Status
```bash
# Check if site is up
curl -I https://www.uvm.edu/~vdondeti

# Check for any hardcoded localhost URLs
cd ~/www-root
grep -r "localhost" . || echo "✅ No localhost references"
```

### View Build Logs
```bash
cd ~/site-src
npm run build 2>&1 | tee build.log
```

## Environment Variables for Production

Create production config:
```bash
cd ~/site-src

# For external API
echo 'VITE_API_URL=https://your-api-server.com/' > .env.production

# For UVM-hosted API
echo 'VITE_API_URL=https://silk.uvm.edu/~vdondeti/api/' > .env.production
```

## Best Practices

1. **Always test locally first:**
   ```bash
   npm run dev  # Test in development
   npm run build && npm run preview  # Test production build
   ```

2. **Keep backups:** The script automatically creates timestamped backups

3. **Monitor the site:** Check https://www.uvm.edu/~vdondeti after each deployment

4. **Database connectivity:** Ensure your production API can connect to `webdb5.uvm.edu`

## Troubleshooting

### Build Fails
```bash
# Clear cache and retry
cd ~/site-src
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Site Not Loading
```bash
# Check file permissions
chmod -R 755 ~/www-root

# Check .htaccess for client-side routing
cat ~/www-root/.htaccess
```

### API Connection Issues
```bash
# Test API connectivity
curl -I https://your-api-server.com/health

# Check CORS settings in your backend
```

## Quick Commands Reference

- **Deploy:** `~/deploy.sh`
- **Rollback:** `cp -a ~/backup-root-TIMESTAMP/. ~/www-root/`
- **Check site:** `curl -I https://www.uvm.edu/~vdondeti`
- **View backups:** `ls -la ~/backup-root-*`