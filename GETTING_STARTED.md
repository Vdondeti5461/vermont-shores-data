# Getting Started with Summit2Shore

## For New Developers

### 1. Clone the Repository
```bash
git clone <YOUR_GIT_URL>
cd summit2shore
```

### 2. Install Dependencies
```bash
# Requires Node.js 14+ and npm
npm install
```

### 3. Start Development Server
```bash
npm run dev
# Opens at http://localhost:5173
```

### 4. Build for Production
```bash
npm run build
# Creates dist/ directory with production-ready files
```

## Project Structure

```
summit2shore/
├── src/                  # Frontend React source code
│   ├── components/       # Reusable UI components
│   ├── pages/           # Route pages
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API and data services
│   └── lib/             # Utilities and configurations
│
├── public/              # Static assets
├── docs/                # Project documentation (BRD, FRD, TRD)
├── supabase/            # Supabase configuration
│
├── production-api-server.js      # Backend API source
├── production-package.json       # Backend dependencies
├── deploy.sh                     # Single server deployment
├── deploy-dual.sh                # Dual server deployment
│
└── Documentation/
    ├── README.md                          # Project overview
    ├── PROJECT_STRUCTURE.md               # Complete architecture
    ├── DEPLOYMENT_QUICK_REFERENCE.md      # Deployment commands
    ├── DUAL_DEPLOYMENT_GUIDE.md           # Frontend deployment guide
    ├── SERVER_VERIFICATION_CHECKLIST.md   # Server troubleshooting
    ├── BACKEND_API_ENDPOINTS.md           # API documentation
    └── TODO.md                            # Future tasks and improvements
```

## Technology Stack

**Frontend**
- React 18 with TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui components
- React Router for routing
- TanStack Query for data fetching

**Backend**
- Node.js + Express
- MySQL database (webdb5.uvm.edu)
- CORS enabled for UVM domains

**Deployment**
- Testing: vdondeti.w3.uvm.edu
- Production: crrels2s.w3.uvm.edu
- Apache web server with proxy to Node.js backend

## Common Development Tasks

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Test Production Build Locally
```bash
npm run build
npm run preview
```

### Check TypeScript Errors
```bash
npx tsc --noEmit
```

### Lint Code
```bash
npm run lint
```

## Environment Detection

The app automatically detects the deployment environment:

- **Development**: `localhost:5173` → Uses local or Lovable API
- **Testing**: `vdondeti.w3.uvm.edu` → Uses testing backend
- **Production**: `crrels2s.w3.uvm.edu` → Uses production backend

Configuration is handled in `src/lib/apiConfig.ts`.

## Key Features

1. **Data Download Interface**
   - Select database, table, locations, date ranges
   - Download data as CSV or Excel
   - Multiple database support

2. **Interactive Maps**
   - Leaflet-based mapping
   - Location visualization
   - Click to select monitoring sites

3. **Analytics Dashboard**
   - Time series visualization
   - Data comparison tools
   - Real-time analytics

4. **Responsive Design**
   - Mobile-friendly interface
   - Tailwind CSS styling
   - Dark/light mode support

## Database Structure

The application connects to MySQL databases on `webdb5.uvm.edu`:

- `CRRELS2S_raw_data_ingestion` - Raw sensor data
- `CRRELS2S_stage_clean_data` - Cleaned data
- `CRRELS2S_stage_qaqc_data` - QA/QC processed data
- `CRRELS2S_seasonal_qaqc_data` - Seasonal aggregations

## Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/my-new-feature
   ```

2. **Make Changes**
   - Edit code in `src/`
   - Test locally with `npm run dev`
   - Verify builds with `npm run build`

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

4. **Push to GitHub**
   ```bash
   git push origin feature/my-new-feature
   ```

5. **Deploy to Testing**
   ```bash
   # On server or via automated deployment
   ./deploy-dual.sh testing
   ```

6. **Verify & Deploy to Production**
   ```bash
   ./deploy-dual.sh production
   ```

## Need Help?

- **Deployment Issues**: See [SERVER_VERIFICATION_CHECKLIST.md](SERVER_VERIFICATION_CHECKLIST.md)
- **API Questions**: See [BACKEND_API_ENDPOINTS.md](BACKEND_API_ENDPOINTS.md)
- **Architecture**: See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- **Quick Commands**: See [DEPLOYMENT_QUICK_REFERENCE.md](DEPLOYMENT_QUICK_REFERENCE.md)

## External Resources

- [Lovable Project](https://lovable.dev/projects/5d5ff90d-8cee-4075-81bd-555a25d8e14f)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite Guide](https://vitejs.dev/)
