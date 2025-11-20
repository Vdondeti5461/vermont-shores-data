# Dual Server Deployment Guide

## Overview
This guide covers deploying the Summit2Shore application to two UVM servers:
- **Testing Server**: `vdondeti.w3.uvm.edu` (for testing and validation) 
- **Production Server**: `crrels2s.w3.uvm.edu` (for production use)

**Deployment Philosophy**: Always test on vdondeti.w3.uvm.edu first, then deploy to crrels2s.w3.uvm.edu production.

> **Note**: This guide covers **frontend-only** deployment. For backend API deployment, see [DEPLOYMENT_QUICK_REFERENCE.md](DEPLOYMENT_QUICK_REFERENCE.md).

## Server Configuration

### Testing Server (Internal)
- **Host**: `vdondeti.w3.uvm.edu`
- **User**: `vdondeti`
- **Path**: `~/www-root`
- **Purpose**: Internal testing and development

### Production Server (Public)
- **Host**: `crrels2s.w3.uvm.edu`
- **User**: `crrels2s`
- **Path**: `~/www-root`
- **Purpose**: Public production site

## Quick Start

### Prerequisites
1. SSH access to both servers
2. SSH keys configured for passwordless authentication
3. Node.js and npm installed locally

### Deploy to Both Servers
```bash
# Make the script executable
chmod +x deploy-dual.sh

# Deploy to both servers (default)
./deploy-dual.sh

# Or explicitly specify both
./deploy-dual.sh both
```

### Deploy to Specific Server
```bash
# Deploy to testing only
./deploy-dual.sh testing

# Deploy to production only
./deploy-dual.sh production
```

## Deployment Workflow

1. **Build Locally**: The script builds the project locally first
2. **Test Connections**: Verifies SSH connectivity to target servers
3. **Create Backups**: Creates timestamped backups on each server
4. **Clear Old Files**: Safely removes existing deployment files
5. **Upload New Files**: Transfers the built application
6. **Set Permissions**: Ensures proper file permissions (755)
7. **Configure Routing**: Adds/updates .htaccess for client-side routing
8. **Validate Deployment**: Checks for development URLs in production bundle

## Features

### Automatic Backup
- Each deployment creates a timestamped backup: `~/backup-root-YYYY-MM-DD-HHMMSS`
- Backups are preserved on each server for rollback purposes

### Connection Testing
- Script tests SSH connectivity before attempting deployment
- Continues with available servers if one is unreachable
- Provides clear status messages for each operation

### Development URL Detection
- Automatically scans deployed files for localhost or development URLs
- Warns if development configurations are found in production bundle

### Colored Output
- Red: Errors and warnings
- Green: Success messages
- Yellow: In-progress operations
- Blue: Information and URLs

## Manual Deployment Steps

If you prefer manual deployment or need to troubleshoot:

### 1. Build the Project
```bash
npm run build
```

### 2. Deploy to Testing Server
```bash
# Create backup
ssh vdondeti@vdondeti.w3.uvm.edu "cp -r ~/www-root ~/backup-root-$(date +%F-%H%M%S)"

# Clear existing files
ssh vdondeti@vdondeti.w3.uvm.edu "rm -rf ~/www-root/*"

# Upload new files
scp -r dist/* vdondeti@vdondeti.w3.uvm.edu:~/www-root/

# Set permissions
ssh vdondeti@vdondeti.w3.uvm.edu "chmod -R 755 ~/www-root"
```

### 3. Deploy to Production Server
```bash
# Create backup
ssh crrels2s@crrels2s.w3.uvm.edu "cp -r ~/www-root ~/backup-root-$(date +%F-%H%M%S)"

# Clear existing files
ssh crrels2s@crrels2s.w3.uvm.edu "rm -rf ~/www-root/*"

# Upload new files
scp -r dist/* crrels2s@crrels2s.w3.uvm.edu:~/www-root/

# Set permissions
ssh crrels2s@crrels2s.w3.uvm.edu "chmod -R 755 ~/www-root"
```

## Rollback Process

### Automatic Rollback
To rollback to a previous version, copy from the timestamped backup:

```bash
# Testing server rollback
ssh vdondeti@vdondeti.w3.uvm.edu "cp -a ~/backup-root-YYYY-MM-DD-HHMMSS/. ~/www-root/"

# Production server rollback
ssh crrels2s@crrels2s.w3.uvm.edu "cp -a ~/backup-root-YYYY-MM-DD-HHMMSS/. ~/www-root/"
```

### List Available Backups
```bash
# Testing server
ssh vdondeti@vdondeti.w3.uvm.edu "ls -la ~/backup-root-*"

# Production server
ssh crrels2s@crrels2s.w3.uvm.edu "ls -la ~/backup-root-*"
```

## Monitoring and Testing

### Test Site Accessibility
```bash
# Test testing server
curl -I https://vdondeti.w3.uvm.edu

# Test production server
curl -I https://crrels2s.w3.uvm.edu
```

### Check Deployment Status
```bash
# Check file permissions
ssh vdondeti@vdondeti.w3.uvm.edu "ls -la ~/www-root/"
ssh crrels2s@crrels2s.w3.uvm.edu "ls -la ~/www-root/"

# Check for .htaccess
ssh vdondeti@vdondeti.w3.uvm.edu "cat ~/www-root/.htaccess"
ssh crrels2s@crrels2s.w3.uvm.edu "cat ~/www-root/.htaccess"
```

## Environment-Specific Configuration

The application automatically detects the deployment environment:

- **Testing**: `vdondeti.w3.uvm.edu` - Uses internal API endpoints
- **Production**: `crrels2s.w3.uvm.edu` - Uses production API endpoints

This is handled by the `src/lib/apiConfig.ts` file which dynamically configures API base URLs based on the hostname.

## Troubleshooting

### SSH Connection Issues
```bash
# Test SSH connectivity
ssh -v vdondeti@vdondeti.w3.uvm.edu
ssh -v crrels2s@crrels2s.w3.uvm.edu

# Check SSH key authentication
ssh-add -l
```

### Permission Issues
```bash
# Fix file permissions
ssh vdondeti@vdondeti.w3.uvm.edu "chmod -R 755 ~/www-root"
ssh crrels2s@crrels2s.w3.uvm.edu "chmod -R 755 ~/www-root"
```

### Build Issues
```bash
# Clean build
rm -rf dist node_modules
npm install
npm run build
```

### .htaccess Issues
If client-side routing isn't working:
```bash
# Check .htaccess exists and is correct
ssh vdondeti@vdondeti.w3.uvm.edu "cat ~/www-root/.htaccess"

# Manually create .htaccess if needed
cat > /tmp/htaccess << 'EOF'
RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
EOF

scp /tmp/htaccess vdondeti@vdondeti.w3.uvm.edu:~/www-root/.htaccess
```

## Best Practices

1. **Test First**: Always deploy to testing server first
2. **Verify Functionality**: Test critical features after deployment
3. **Monitor Logs**: Check browser console and server logs
4. **Backup Strategy**: Keep multiple backup versions
5. **Environment Variables**: Ensure production configurations are correct
6. **Performance**: Monitor site performance after deployment
7. **Security**: Regularly update dependencies and check for vulnerabilities

## Quick Commands Reference

```bash
# Deploy to both servers
./deploy-dual.sh both

# Deploy to testing only
./deploy-dual.sh testing

# Deploy to production only  
./deploy-dual.sh production

# Test sites
curl -I https://vdondeti.w3.uvm.edu
curl -I https://crrels2s.w3.uvm.edu

# View backups
ssh vdondeti@vdondeti.w3.uvm.edu "ls -la ~/backup-root-*"
ssh crrels2s@crrels2s.w3.uvm.edu "ls -la ~/backup-root-*"

# Rollback (replace TIMESTAMP with actual backup timestamp)
ssh vdondeti@vdondeti.w3.uvm.edu "cp -a ~/backup-root-TIMESTAMP/. ~/www-root/"
ssh crrels2s@crrels2s.w3.uvm.edu "cp -a ~/backup-root-TIMESTAMP/. ~/www-root/"
```

## Migration from Single Server

If you're migrating from the original `deploy.sh` single server setup:

1. **Backup Current Deployment Script**: `cp deploy.sh deploy-single.sh`
2. **Use New Script**: Start using `deploy-dual.sh` for dual deployment
3. **Update Documentation**: Update any deployment documentation to reference the new script
4. **Team Communication**: Inform team members about the new deployment process