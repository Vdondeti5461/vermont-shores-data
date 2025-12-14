# Summit2Shore Environmental Data Platform

## Project Overview

The Summit2Shore platform provides access to environmental monitoring data from Vermont watersheds, enabling researchers and stakeholders to download and analyze water quality, temperature, and other environmental parameters.

## Live Deployment

- **Production**: https://crrels2s.w3.uvm.edu

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

Clone this repo and push changes. The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Quick Links

📚 **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** - Complete documentation navigation

🚀 **[CRRELS2S_DEPLOYMENT.md](CRRELS2S_DEPLOYMENT.md)** - Production deployment guide

🔧 **[SERVER_VERIFICATION_CHECKLIST.md](SERVER_VERIFICATION_CHECKLIST.md)** - Troubleshooting

📋 **[TODO.md](TODO.md)** - Future tasks and roadmap

## Production Deployment

### Automated Deployment (Recommended)

Changes pushed to the `main` branch automatically deploy to **crrels2s.w3.uvm.edu** via GitHub Actions.

**Setup once:**
1. Generate SSH key pair on server
2. Add private key to GitHub Secrets as `SSH_PRIVATE_KEY`
3. Done! Future pushes auto-deploy

📖 **See [AUTOMATED_DEPLOYMENT.md](AUTOMATED_DEPLOYMENT.md) for setup instructions**

### Manual Deployment

Deploy manually with a single command:

```bash
cd ~/vermont-shores-data
chmod +x deploy-crrels2s.sh
./deploy-crrels2s.sh
```

This script:
- ✅ Pulls latest code from GitHub
- ✅ Builds React frontend → deploys to `~/www-root/`
- ✅ Updates Node.js backend → deploys to `~/api/`
- ✅ Restarts API server with pm2
- ✅ Creates automatic backups
- ✅ Tests API health

### Production Architecture

**Frontend**: React + TypeScript + Vite + Tailwind CSS
- Source: `src/`
- Build: `dist/`
- Deployment: `~/www-root/` (served by Apache)

**Backend**: Node.js + Express + MySQL
- Source: `production-api-server.js`
- Deployment: `~/api/`
- Database: MySQL (CRREL2S databases)
- Process Manager: pm2

### Server Structure on crrels2s.w3.uvm.edu
```
~/vermont-shores-data/  # Git repository (source code)
~/www-root/             # Frontend deployment
~/api/                  # Backend deployment
~/backup-*/             # Automatic timestamped backups
```

📖 **See [CRRELS2S_DEPLOYMENT.md](CRRELS2S_DEPLOYMENT.md) for detailed deployment guide**

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Backend API

The backend API provides endpoints for:
- Database listing
- Table metadata
- Location data
- Data downloads (CSV)
- Analytics

See [BACKEND_API_ENDPOINTS.md](BACKEND_API_ENDPOINTS.md) for API documentation.

## Documentation

All documentation is organized in **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)**

### Quick Links
- 🚀 Deploy to production? [CRRELS2S_DEPLOYMENT.md](CRRELS2S_DEPLOYMENT.md)
- 🔧 API documentation? [BACKEND_API_ENDPOINTS.md](BACKEND_API_ENDPOINTS.md)
- 🐛 Troubleshooting? [SERVER_VERIFICATION_CHECKLIST.md](SERVER_VERIFICATION_CHECKLIST.md)
- 📋 What's next? [TODO.md](TODO.md)
