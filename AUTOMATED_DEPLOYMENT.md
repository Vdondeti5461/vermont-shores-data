# Automated Deployment with GitHub Actions

## Overview

This project uses GitHub Actions to automatically deploy to `crrels2s.w3.uvm.edu` whenever changes are pushed to the `main` branch.

## How It Works

1. **Make changes** and push to GitHub
2. **GitHub Actions triggers** automatically on push to main branch
3. **SSH into server** using stored credentials
4. **Runs deployment script** (`deploy-crrels2s.sh`)
5. **Updates live site** at the production URL

## Setup Instructions

### Step 1: Generate SSH Key Pair on Server

SSH into your server and generate a key pair:

```bash
ssh crrels2s@crrels2s.w3.uvm.edu
cd ~/.ssh
ssh-keygen -t ed25519 -C "github-actions-deploy" -f github_deploy_key
```

When prompted for a passphrase, press Enter (leave it empty).

### Step 2: Add Public Key to Authorized Keys

```bash
cat github_deploy_key.pub >> authorized_keys
chmod 600 authorized_keys
```

### Step 3: Copy Private Key

Display the private key:

```bash
cat github_deploy_key
```

Copy the entire output (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`).

### Step 4: Add Private Key to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `SSH_PRIVATE_KEY`
5. Value: Paste the private key you copied
6. Click **Add secret**

### Step 5: Verify deploy-crrels2s.sh is Executable

Make sure the deployment script has execute permissions:

```bash
ssh crrels2s@crrels2s.w3.uvm.edu
cd ~/vermont-shores-data
chmod +x deploy-crrels2s.sh
```

### Step 6: Test the Automation

1. Make a small change and push to GitHub
2. Go to your repository's **Actions** tab
3. Watch the deployment workflow run
4. Check the production site to see your changes

## Monitoring Deployments

### View Deployment Status

- **GitHub Actions tab**: Shows real-time deployment progress
- **Workflow runs**: Click on any run to see detailed logs

### Check Server Logs

SSH into the server to view deployment logs:

```bash
ssh crrels2s@crrels2s.w3.uvm.edu
cd ~/vermont-shores-data
# View recent git pulls
git log -3

# View API server logs
pm2 logs crrels2s-api

# View deployment backups
ls -la ~/backup-*
```

## Manual Deployment (Fallback)

If automated deployment fails, you can always deploy manually:

```bash
ssh crrels2s@crrels2s.w3.uvm.edu
cd ~/vermont-shores-data
./deploy-crrels2s.sh
```

## Troubleshooting

### Deployment Fails with "Permission denied (publickey)"

1. Verify the SSH private key is correctly added to GitHub Secrets
2. Ensure the public key is in `~/.ssh/authorized_keys` on the server
3. Check that the key file has correct permissions: `chmod 600 ~/.ssh/github_deploy_key`

### Deployment Succeeds but Site Not Updated

1. Check if build process completed: `ls -la ~/www-root/`
2. View API server status: `pm2 status`
3. Check API logs: `pm2 logs crrels2s-api`
4. Verify Apache is serving files: `curl -I https://crrels2s.w3.uvm.edu`

### Script Execution Fails

1. Verify script is executable: `chmod +x ~/vermont-shores-data/deploy-crrels2s.sh`
2. Check script logs in GitHub Actions workflow run
3. Test script manually on server

### Build Fails with npm Errors

1. Clear npm cache: `npm cache clean --force`
2. Remove node_modules: `rm -rf ~/vermont-shores-data/node_modules`
3. Reinstall dependencies: `cd ~/vermont-shores-data && npm ci`

## Workflow File Location

The GitHub Actions workflow is defined in:
- `.github/workflows/deploy-crrels2s.yml`

## Security Notes

- The SSH private key is stored securely in GitHub Secrets (encrypted)
- Never commit the private key to the repository
- The key only has access to the crrels2s user account
- Consider rotating the SSH key periodically for security

## Disabling Automated Deployment

If you need to temporarily disable automated deployments:

1. Go to repository **Settings** → **Actions** → **General**
2. Under "Actions permissions", select "Disable actions"
3. Or delete `.github/workflows/deploy-crrels2s.yml`

## Re-enabling Automated Deployment

Simply re-enable Actions in Settings or restore the workflow file.
