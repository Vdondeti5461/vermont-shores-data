#!/bin/bash
set -e

# Summit2Shore Dual Deployment Script
# Deploys FRONTEND ONLY to UVM servers: vdondeti.w3.uvm.edu (testing) and crrels2s.w3.uvm.edu (production)
# 
# Usage:
#   ./deploy-dual.sh           # Deploy to both servers
#   ./deploy-dual.sh testing   # Deploy to testing only
#   ./deploy-dual.sh production # Deploy to production only
#
# Note: This script deploys the frontend only (React build to ~/www-root/)
# For backend API deployment, see DEPLOYMENT_QUICK_REFERENCE.md

# Make the script executable on first run
chmod +x "$0" 2>/dev/null || true

DEPLOYMENT_TYPE=${1:-both}

echo "🚀 Starting dual deployment process..."
echo "📋 Deployment type: $DEPLOYMENT_TYPE"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Server configurations
TESTING_SERVER="vdondeti.w3.uvm.edu"
PRODUCTION_SERVER="crrels2s.w3.uvm.edu"

TESTING_PATH="~/www-root"
PRODUCTION_PATH="~/www-root"

TESTING_USER="vdondeti"
PRODUCTION_USER="crrels2s"

# Function to deploy to a server
deploy_to_server() {
    local server_name=$1
    local server_host=$2
    local server_user=$3
    local server_path=$4
    
    echo -e "${BLUE}📡 Deploying to $server_name ($server_host)...${NC}"
    
    # Build the project locally first
    if [ ! -d "dist" ]; then
        echo -e "${YELLOW}🏗️  Building project locally...${NC}"
        npm run build
    fi
    
    # Create timestamped backup on remote server
    echo -e "${YELLOW}💾 Creating backup on $server_name...${NC}"
    ts=$(date +%F-%H%M%S)
    ssh ${server_user}@${server_host} "cp -r $server_path ~/backup-root-$ts 2>/dev/null || true"
    
    # Clear existing files on remote server
    echo -e "${YELLOW}🧹 Clearing existing files on $server_name...${NC}"
    ssh ${server_user}@${server_host} "rm -rf $server_path/* $server_path/.[!.]* $server_path/..?* 2>/dev/null || true"
    
    # Upload new files
    echo -e "${YELLOW}📤 Uploading files to $server_name...${NC}"
    scp -r dist/* ${server_user}@${server_host}:$server_path/
    
    # Set proper permissions
    echo -e "${YELLOW}🔒 Setting permissions on $server_name...${NC}"
    ssh ${server_user}@${server_host} "chmod -R 755 $server_path"
    
    # Ensure .htaccess exists for client-side routing
    echo -e "${YELLOW}📝 Ensuring .htaccess exists on $server_name...${NC}"
    ssh ${server_user}@${server_host} "
    if [ ! -f $server_path/.htaccess ]; then
        cat > $server_path/.htaccess << 'EOF'
RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
EOF
    fi
    "
    
    # Check for development URLs in production bundle
    echo -e "${YELLOW}🔍 Checking for development URLs on $server_name...${NC}"
    if ssh ${server_user}@${server_host} "cd $server_path && grep -r --text -q 'localhost\|:3001' . 2>/dev/null"; then
        echo -e "${RED}⚠️  Warning: Found development URLs in $server_name bundle${NC}"
        ssh ${server_user}@${server_host} "cd $server_path && grep -r --text -n 'localhost\|:3001' . | head -5"
    else
        echo -e "${GREEN}✅ No development URLs found in $server_name bundle${NC}"
    fi
    
    echo -e "${GREEN}✅ Deployment to $server_name completed successfully!${NC}"
    echo -e "${BLUE}🌐 Site URL: https://$server_host${NC}"
    echo -e "${BLUE}📁 Backup saved as: ~/backup-root-$ts${NC}"
}

# Function to test server connectivity
test_server_connection() {
    local server_name=$1
    local server_host=$2
    local server_user=$3
    
    echo -e "${YELLOW}🔌 Testing connection to $server_name...${NC}"
    if ssh -o ConnectTimeout=10 ${server_user}@${server_host} "echo 'Connection successful'" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Connection to $server_name successful${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to connect to $server_name${NC}"
        return 1
    fi
}

# Main deployment logic
case $DEPLOYMENT_TYPE in
    "testing")
        echo -e "${BLUE}🎯 Deploying to TESTING server only${NC}"
        if test_server_connection "Testing" $TESTING_SERVER $TESTING_USER; then
            deploy_to_server "Testing" $TESTING_SERVER $TESTING_USER $TESTING_PATH
        else
            echo -e "${RED}❌ Deployment to testing server failed due to connection issues${NC}"
            exit 1
        fi
        ;;
    "production")
        echo -e "${BLUE}🎯 Deploying to PRODUCTION server only${NC}"
        if test_server_connection "Production" $PRODUCTION_SERVER $PRODUCTION_USER; then
            deploy_to_server "Production" $PRODUCTION_SERVER $PRODUCTION_USER $PRODUCTION_PATH
        else
            echo -e "${RED}❌ Deployment to production server failed due to connection issues${NC}"
            exit 1
        fi
        ;;
    "both"|*)
        echo -e "${BLUE}🎯 Deploying to BOTH servers${NC}"
        
        # Test connections first
        testing_ok=false
        production_ok=false
        
        if test_server_connection "Testing" $TESTING_SERVER $TESTING_USER; then
            testing_ok=true
        fi
        
        if test_server_connection "Production" $PRODUCTION_SERVER $PRODUCTION_USER; then
            production_ok=true
        fi
        
        # Deploy to available servers
        if [ "$testing_ok" = true ]; then
            deploy_to_server "Testing" $TESTING_SERVER $TESTING_USER $TESTING_PATH
        else
            echo -e "${RED}⚠️  Skipping testing server due to connection issues${NC}"
        fi
        
        if [ "$production_ok" = true ]; then
            deploy_to_server "Production" $PRODUCTION_SERVER $PRODUCTION_USER $PRODUCTION_PATH
        else
            echo -e "${RED}⚠️  Skipping production server due to connection issues${NC}"
        fi
        
        if [ "$testing_ok" = false ] && [ "$production_ok" = false ]; then
            echo -e "${RED}❌ Both deployments failed due to connection issues${NC}"
            exit 1
        fi
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Deployment process completed!${NC}"
echo ""
echo -e "${BLUE}📊 Summary:${NC}"
if [ "$DEPLOYMENT_TYPE" = "testing" ] || [ "$DEPLOYMENT_TYPE" = "both" ]; then
    echo -e "${BLUE}  🧪 Testing: https://$TESTING_SERVER${NC}"
fi
if [ "$DEPLOYMENT_TYPE" = "production" ] || [ "$DEPLOYMENT_TYPE" = "both" ]; then
    echo -e "${BLUE}  🚀 Production: https://$PRODUCTION_SERVER${NC}"
fi
echo ""
echo -e "${YELLOW}Quick commands:${NC}"
echo -e "${YELLOW}  - Test testing site: curl -I https://$TESTING_SERVER${NC}"
echo -e "${YELLOW}  - Test production site: curl -I https://$PRODUCTION_SERVER${NC}"
echo -e "${YELLOW}  - View backups: ls -la ~/backup-root-*${NC}"
echo -e "${YELLOW}  - Deploy testing only: ./deploy-dual.sh testing${NC}"
echo -e "${YELLOW}  - Deploy production only: ./deploy-dual.sh production${NC}"
echo -e "${YELLOW}  - Deploy both: ./deploy-dual.sh both${NC}"