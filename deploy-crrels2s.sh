#!/bin/bash
set -e

# Summit2Shore Production Deployment Script for crrels2s.w3.uvm.edu
# Deploys both FRONTEND and BACKEND to crrels2s production server
# 
# Usage: ./deploy-crrels2s.sh

# Load nvm for non-interactive shells (required for GitHub Actions SSH)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "🚀 Starting deployment to crrels2s.w3.uvm.edu..."
cd ~/vermont-shores-data

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Pull latest changes from GitHub
echo -e "${BLUE}🔄 Pulling latest changes from GitHub...${NC}"
git fetch origin main
git reset --hard origin/main

# Check if package.json changed and install dependencies if needed
if git diff HEAD~1 HEAD --name-only | grep -q package.json 2>/dev/null || [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing/updating frontend dependencies...${NC}"
    npm ci
else
    echo -e "${GREEN}📦 Frontend dependencies up to date${NC}"
fi

# Build production frontend bundle
echo -e "${BLUE}🏗️  Building production frontend...${NC}"
npm run build

# Create backup of current frontend
echo -e "${YELLOW}💾 Creating backup of current frontend...${NC}"
ts=$(date +%F-%H%M%S)
cp -r ~/www-root ~/backup-frontend-$ts 2>/dev/null || true

# Deploy frontend to production
echo -e "${BLUE}🚀 Deploying frontend to ~/www-root/...${NC}"
rm -rf ~/www-root/* ~/www-root/.[!.]* ~/www-root/..?* 2>/dev/null || true
cp -a dist/. ~/www-root/

# Ensure proper permissions for frontend
chmod -R 755 ~/www-root

# Ensure .htaccess exists for API proxying and client-side routing
echo -e "${YELLOW}📝 Checking .htaccess configuration...${NC}"
# Always recreate .htaccess to ensure auth routes work
echo -e "${YELLOW}Creating .htaccess with auth routing...${NC}"
cat > ~/www-root/.htaccess << 'EOF'
RewriteEngine On
RewriteBase /

# Serve UVM favicon for all routes
RedirectMatch 302 ^/favicon\.ico$ /lovable-uploads/6cc4d90f-0179-494a-a8be-7a9a1c70a0e9.png
RedirectMatch 302 ^/api/favicon\.ico$ /lovable-uploads/6cc4d90f-0179-494a-a8be-7a9a1c70a0e9.png
RedirectMatch 302 ^/health/favicon\.ico$ /lovable-uploads/6cc4d90f-0179-494a-a8be-7a9a1c70a0e9.png

# Proxy auth API endpoints to Node.js backend (only paths like /auth/login, /auth/forgot-password)
RewriteCond %{REQUEST_URI} ^/auth/.+
RewriteRule ^(.*)$ http://127.0.0.1:3001/$1 [P,L]

# Proxy API requests to Node.js backend (includes /api-keys)
RewriteCond %{REQUEST_URI} ^/(health|api|api-keys)
RewriteRule ^(.*)$ http://127.0.0.1:3001/$1 [P,L]

# Client-side routing for React (handles /auth page for UI)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/(health|api|api-keys)
RewriteCond %{REQUEST_URI} !^/auth/.+
RewriteRule . /index.html [L]
EOF

# Check for any hardcoded localhost URLs in frontend
echo -e "${BLUE}🔍 Checking for development URLs in frontend bundle...${NC}"
cd ~/www-root
if grep -r --text -q "localhost\|:3001" . 2>/dev/null; then
    echo -e "${RED}⚠️  Warning: Found development URLs in production bundle${NC}"
    grep -r --text -n "localhost\|:3001" . | head -5
else
    echo -e "${GREEN}✅ No development URLs found in frontend bundle${NC}"
fi

# Deploy backend API
echo -e "${BLUE}🔧 Deploying backend API to ~/api/...${NC}"
cd ~/vermont-shores-data

# Create backup of current backend
cp -r ~/api ~/backup-api-$ts 2>/dev/null || true

# Copy backend files
cp production-api-server.js ~/api/
cp production-package.json ~/api/package.json

# Copy authentication modules (routes, middleware, config)
echo -e "${YELLOW}🔐 Deploying authentication modules...${NC}"
mkdir -p ~/api/routes ~/api/middleware ~/api/config
cp -r api/routes/* ~/api/routes/ 2>/dev/null || echo "No routes to copy"
cp -r api/middleware/* ~/api/middleware/ 2>/dev/null || echo "No middleware to copy"
cp -r api/config/* ~/api/config/ 2>/dev/null || echo "No config to copy"

# Install backend dependencies
echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
cd ~/api
npm install

# Check if API server is running with pm2
echo -e "${BLUE}🔄 Managing API server with pm2...${NC}"
if pm2 describe crrels2s-api > /dev/null 2>&1; then
    echo -e "${YELLOW}Restarting existing API server...${NC}"
    pm2 restart crrels2s-api
else
    echo -e "${YELLOW}Starting new API server...${NC}"
    pm2 start production-api-server.js --name crrels2s-api
fi

# Save pm2 configuration
pm2 save

# Wait for API to start
sleep 3

# Test API health
echo -e "${BLUE}🏥 Testing API health...${NC}"
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API health check passed${NC}"
else
    echo -e "${RED}⚠️  API health check failed - check logs: pm2 logs crrels2s-api${NC}"
fi

# Test seasonal tables endpoint
echo -e "${BLUE}📊 Testing seasonal tables endpoint...${NC}"
if curl -f http://localhost:3001/api/seasonal/tables > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Seasonal tables endpoint working${NC}"
else
    echo -e "${RED}⚠️  Seasonal tables endpoint failed${NC}"
fi

# Test auth signup endpoint (should return 400 without body - that means route exists)
echo -e "${BLUE}🔐 Testing auth routes...${NC}"
AUTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3001/auth/signup 2>/dev/null || echo "000")
if [ "$AUTH_RESPONSE" = "400" ] || [ "$AUTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Auth routes mounted successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Auth routes may not be mounted (HTTP $AUTH_RESPONSE) - check pm2 logs${NC}"
fi

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📊 Deployment Summary:${NC}"
echo -e "${BLUE}  🌐 Frontend: https://crrels2s.w3.uvm.edu${NC}"
echo -e "${BLUE}  🔧 Backend API: https://crrels2s.w3.uvm.edu/api${NC}"
echo -e "${BLUE}  🏥 Health Check: https://crrels2s.w3.uvm.edu/health${NC}"
echo -e "${BLUE}  📁 Frontend Backup: ~/backup-frontend-$ts${NC}"
echo -e "${BLUE}  📁 Backend Backup: ~/backup-api-$ts${NC}"
echo ""
echo -e "${YELLOW}Quick commands:${NC}"
echo -e "${YELLOW}  - Test site: curl -I https://crrels2s.w3.uvm.edu${NC}"
echo -e "${YELLOW}  - Test API: curl https://crrels2s.w3.uvm.edu/api/seasonal/tables${NC}"
echo -e "${YELLOW}  - Test Auth: curl -X POST https://crrels2s.w3.uvm.edu/auth/login${NC}"
echo -e "${YELLOW}  - View API logs: pm2 logs crrels2s-api${NC}"
echo -e "${YELLOW}  - API status: pm2 status${NC}"
echo -e "${YELLOW}  - Restart API: pm2 restart crrels2s-api${NC}"
echo -e "${YELLOW}  - View backups: ls -la ~/backup-*${NC}"
echo -e "${YELLOW}  - Rollback frontend: cp -a ~/backup-frontend-$ts/. ~/www-root/${NC}"
echo -e "${YELLOW}  - Rollback backend: cp -a ~/backup-api-$ts/. ~/api/${NC}"
