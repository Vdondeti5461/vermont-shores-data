#!/bin/bash
set -e

echo "🚀 Starting deployment to production..."
cd ~/site-src

# Pull latest changes from GitHub
echo "🔄 Pulling latest changes from GitHub..."
# Always fetch latest and force-update remote tracking branch to handle divergence
echo "📡 Fetching origin/main..."
if ! git fetch origin +main:refs/remotes/origin/main; then
  echo "⚠️ Fetch encountered an issue. Setting pull strategy to merge and retrying..."
  git config --global pull.rebase false || true
  git fetch origin +main:refs/remotes/origin/main
fi

# Safety: save current local state (branch + stash) before resetting
_git_ts=$(date +%F-%H%M%S)
_backup_branch="local-backup-${_git_ts}"
(git branch "${_backup_branch}" >/dev/null 2>&1 && echo "🛟 Created backup branch: ${_backup_branch}") || true
(git stash push -u -m "deploy backup ${_git_ts}" >/dev/null 2>&1 && echo "🧳 Stashed any uncommitted changes (if any)") || true

# Force align working tree to remote main
echo "📥 Resetting working tree to origin/main..."
git reset --hard origin/main
# Clean untracked files that may interfere with builds
git clean -fd

# Check if package.json changed and install dependencies if needed
if git diff HEAD~1 HEAD --name-only | grep -q package.json 2>/dev/null || [ ! -d "node_modules" ]; then
    echo "📦 Installing/updating dependencies..."
    npm ci
else
    echo "📦 Dependencies up to date"
fi

# Build production bundle
echo "🏗️  Building production bundle..."
npm run build

# Create backup of current site
echo "💾 Creating backup of current site..."
ts=$(date +%F-%H%M%S)
cp -r ~/www-root ~/backup-root-$ts 2>/dev/null || true

# Deploy to production
echo "🚀 Deploying to production..."
rm -rf ~/www-root/* ~/www-root/.[!.]* ~/www-root/..?* 2>/dev/null || true
cp -a dist/. ~/www-root/

# Ensure proper permissions
chmod -R 755 ~/www-root

# Add .htaccess for client-side routing if it doesn't exist
if [ ! -f ~/www-root/.htaccess ]; then
    echo "📝 Creating .htaccess for client-side routing..."
    cat > ~/www-root/.htaccess << 'EOF'
RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
EOF
fi

# Check for any hardcoded localhost URLs
echo "🔍 Checking for development URLs in production bundle..."
cd ~/www-root
if grep -r --text -q "localhost\|:3001" . 2>/dev/null; then
    echo "⚠️  Warning: Found development URLs in production bundle"
    grep -r --text -n "localhost\|:3001" . | head -5
else
    echo "✅ No development URLs found in production bundle"
fi

echo ""
echo "✅ Deployment completed successfully!"
echo "🌐 Your site is live at: https://www.uvm.edu/~vdondeti"
echo "📁 Backup saved as: ~/backup-root-$ts"
echo ""
echo "Quick commands:"
echo "  - Test site: curl -I https://www.uvm.edu/~vdondeti"
echo "  - View backups: ls -la ~/backup-root-*"
echo "  - Rollback: cp -a ~/backup-root-$ts/. ~/www-root/"