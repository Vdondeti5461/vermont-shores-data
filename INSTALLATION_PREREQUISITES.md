# Complete Installation Prerequisites for crrels2s.w3.uvm.edu

## 🎯 Overview

This guide covers all required software installations and prerequisites needed before deploying the Summit2Shore application to crrels2s.w3.uvm.edu.

---

## ✅ Step-by-Step Installation Checklist

### Step 1: Verify SSH Access

```bash
# From your local machine, test SSH connection
ssh crrels2s@crrels2s.w3.uvm.edu

# You should see a prompt like:
# [crrels2s@silk33 ~]$
```

**If this fails:**
- Contact your system administrator for SSH access
- Ensure you have the correct username and password
- Check if you need to be on VPN

---

### Step 2: Check Node.js Installation

```bash
# Once logged into crrels2s server
node --version

# Expected: v14.x.x or higher
# Recommended: v18.17.0 or higher
```

**If Node.js is NOT installed:**

#### Option A: Ask System Administrator
Contact your system admin to install Node.js system-wide.

#### Option B: Install Node.js in Your Home Directory

```bash
# On crrels2s server
cd ~

# Download Node.js (version 18.17.0 LTS)
wget https://nodejs.org/dist/v18.17.0/node-v18.17.0-linux-x64.tar.xz

# Extract
tar -xf node-v18.17.0-linux-x64.tar.xz

# Add to PATH
echo 'export PATH=~/node-v18.17.0-linux-x64/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Verify installation
node --version
npm --version
```

**Expected output:**
```
v18.17.0
9.6.7
```

---

### Step 3: Verify npm Installation

```bash
npm --version

# Expected: 6.x.x or higher
# Comes bundled with Node.js
```

---

### Step 4: Install PM2 (Process Manager)

PM2 keeps your backend API running continuously and auto-restarts on crashes.

```bash
# Install PM2 globally
npm install -g pm2

# Verify installation
pm2 --version

# Expected output: 5.x.x or higher
```

**If permission denied:**
```bash
# Try with --prefix flag to install in home directory
npm install -g pm2 --prefix=$HOME/.npm-global
echo 'export PATH=$HOME/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
pm2 --version
```

---

### Step 5: Verify Apache Web Server

Apache should already be running on your UVM server.

```bash
# Check if Apache is running
curl -I http://localhost

# Expected: HTTP/1.1 200 OK or similar response
```

**Check Apache modules (may need admin access):**
```bash
apache2ctl -M | grep proxy
# or
httpd -M | grep proxy

# Should show:
#  proxy_module (shared)
#  proxy_http_module (shared)
```

**If proxy modules are missing:**
Contact your system administrator to enable:
- mod_proxy
- mod_proxy_http

---

### Step 6: Verify MySQL Database Access

Your application connects to an external MySQL database at web5.uvm.edu.

```bash
# Test database connection from crrels2s server
mysql -h web5.uvm.edu -u silk -p

# Enter the password when prompted
# You should see: mysql>

# Test a simple query
USE silk;
SHOW TABLES;
EXIT;
```

**Expected:** You should see a list of tables like `StdMet_Barn_Hourly`, `StdMet_Bolton_Hourly`, etc.

**If connection fails:**
- Verify you have the correct database password
- Check if web5.uvm.edu allows connections from crrels2s server
- Contact database administrator

---

### Step 7: Create Required Directories

```bash
# On crrels2s server, verify www-root exists
cd ~
ls -la

# You should see:
# www-root/

# If www-root doesn't exist:
mkdir -p ~/www-root

# Create api directory (will be used for backend)
mkdir -p ~/api
```

---

### Step 8: Set Up SSH Keys (Optional but Recommended)

SSH keys allow password-less deployment from your local machine.

#### On Your Local Machine:

```bash
# Generate SSH key if you don't have one
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Copy public key to crrels2s server
ssh-copy-id crrels2s@crrels2s.w3.uvm.edu

# Test password-less login
ssh crrels2s@crrels2s.w3.uvm.edu
# Should login without asking for password
```

---

### Step 9: Install Git (Optional - for version control)

```bash
# Check if git is installed
git --version

# If not installed and you need it:
# Contact system admin or install in home directory
```

---

### Step 10: Verify Disk Space

```bash
# Check available disk space
df -h ~

# Ensure you have at least:
# - 500 MB for backend API
# - 100 MB for frontend
# - 200 MB for node_modules
# Total: At least 1 GB free recommended
```

---

## 🔍 Complete Prerequisites Verification Script

Run this script on crrels2s server to verify all prerequisites:

```bash
#!/bin/bash
echo "=== Summit2Shore Prerequisites Check ==="
echo ""

# Node.js
echo -n "Node.js: "
if command -v node &> /dev/null; then
    echo "✓ Installed ($(node --version))"
else
    echo "✗ Not installed"
fi

# npm
echo -n "npm: "
if command -v npm &> /dev/null; then
    echo "✓ Installed ($(npm --version))"
else
    echo "✗ Not installed"
fi

# PM2
echo -n "PM2: "
if command -v pm2 &> /dev/null; then
    echo "✓ Installed ($(pm2 --version))"
else
    echo "✗ Not installed"
fi

# Apache
echo -n "Apache: "
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|403\|301"; then
    echo "✓ Running"
else
    echo "✗ Not detected"
fi

# MySQL connection
echo -n "MySQL (web5.uvm.edu): "
if mysql -h web5.uvm.edu -u silk -p[PASSWORD] -e "SELECT 1" &> /dev/null; then
    echo "✓ Connected"
else
    echo "? Cannot verify (password required)"
fi

# Directories
echo -n "www-root directory: "
if [ -d ~/www-root ]; then
    echo "✓ Exists"
else
    echo "✗ Not found"
fi

echo -n "api directory: "
if [ -d ~/api ]; then
    echo "✓ Exists"
else
    echo "✗ Not found (will create during deployment)"
fi

# Disk space
echo ""
echo "Disk Space:"
df -h ~ | grep -v Filesystem

echo ""
echo "=== End Prerequisites Check ==="
```

**Save this as check-prereqs.sh and run:**
```bash
chmod +x check-prereqs.sh
./check-prereqs.sh
```

---

## 📋 Prerequisites Summary Checklist

Before proceeding with deployment, ensure:

- [x] SSH access to crrels2s@crrels2s.w3.uvm.edu works
- [x] Node.js v14+ is installed
- [x] npm is installed
- [x] PM2 is installed globally
- [x] Apache web server is running
- [x] Apache proxy modules are enabled
- [x] MySQL connection to web5.uvm.edu works
- [x] ~/www-root directory exists
- [x] At least 1 GB free disk space
- [x] (Optional) SSH keys configured for password-less login

---

## 🚦 Ready to Deploy?

Once all prerequisites are met, proceed to [DEPLOY_TO_PRODUCTION.md](./DEPLOY_TO_PRODUCTION.md) for the complete deployment process.

---

## ❓ Troubleshooting Prerequisites

### Node.js Installation Issues

**Problem:** Can't install Node.js globally
**Solution:** Install in home directory as shown in Step 2, Option B

### PM2 Installation Issues

**Problem:** npm permission errors when installing PM2
**Solution:** Use `--prefix=$HOME/.npm-global` flag as shown in Step 4

### MySQL Connection Issues

**Problem:** Can't connect to web5.uvm.edu
**Solution:** 
- Verify you're using the correct credentials
- Check if firewall allows connections from crrels2s
- Contact database administrator

### Apache Proxy Not Working

**Problem:** mod_proxy not enabled
**Solution:** Contact system administrator to enable:
```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo systemctl restart apache2
```

### Disk Space Issues

**Problem:** Not enough disk space
**Solution:** 
- Clean up old backups: `rm -rf ~/backup-root-*`
- Remove old logs: `pm2 flush`
- Contact administrator for more space

---

## 📞 Quick Reference Commands

```bash
# Check all prerequisites
node --version && npm --version && pm2 --version

# Test MySQL connection
mysql -h web5.uvm.edu -u silk -p -e "SHOW DATABASES;"

# Check Apache
curl -I http://localhost

# Check disk space
df -h ~

# Test SSH from local machine
ssh crrels2s@crrels2s.w3.uvm.edu "echo 'SSH works!'"
```

---

## ✅ Next Steps

After all prerequisites are installed:

1. Review [DEPLOY_TO_PRODUCTION.md](./DEPLOY_TO_PRODUCTION.md)
2. Run the automated deployment: `./deploy-dual.sh production`
3. Or follow manual deployment steps in the guide

---

**Last Updated:** October 2025  
**Tested On:** UVM silk31 (vdondeti) and silk33 (crrels2s) servers
