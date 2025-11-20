# Summit2Shore Environmental Data Platform

## Project Overview

The Summit2Shore platform provides access to environmental monitoring data from Vermont watersheds, enabling researchers and stakeholders to download and analyze water quality, temperature, and other environmental parameters.

**Lovable Project**: https://lovable.dev/projects/5d5ff90d-8cee-4075-81bd-555a25d8e14f

## Live Deployments

- **Testing Environment**: https://vdondeti.w3.uvm.edu
- **Production Environment**: https://crrels2s.w3.uvm.edu

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/5d5ff90d-8cee-4075-81bd-555a25d8e14f) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

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

🚀 **[GETTING_STARTED.md](GETTING_STARTED.md)** - New developer setup guide

⚡ **[DEPLOYMENT_QUICK_REFERENCE.md](DEPLOYMENT_QUICK_REFERENCE.md)** - Deploy commands

📋 **[TODO.md](TODO.md)** - Future tasks and roadmap

## Deployment to UVM Servers

This project uses a dual-server deployment strategy:

### Quick Deploy
```bash
# Deploy to both testing and production
./deploy-dual.sh

# Deploy to testing only
./deploy-dual.sh testing

# Deploy to production only
./deploy-dual.sh production
```

### Architecture

**Frontend**: React + TypeScript + Vite + Tailwind CSS
- Source: `src/`
- Build output: `dist/` (deployed to `~/www-root/` on servers)

**Backend**: Node.js + Express + MySQL
- Source: `production-api-server.js`
- Deployed: `~/api/` on servers
- Database: MySQL on `webdb5.uvm.edu`

### Server Structure
```
~/site-src/     # Source code from GitHub
~/api/          # Backend API deployment
~/www-root/     # Frontend build (Apache serves from here)
```

📖 **See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for complete details**

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
- 🚀 New here? Start with [GETTING_STARTED.md](GETTING_STARTED.md)
- 🔧 Deployment help? See [DEPLOYMENT_QUICK_REFERENCE.md](DEPLOYMENT_QUICK_REFERENCE.md)
- 🐛 Issues? Check [SERVER_VERIFICATION_CHECKLIST.md](SERVER_VERIFICATION_CHECKLIST.md)
- 📋 What's next? View [TODO.md](TODO.md)
