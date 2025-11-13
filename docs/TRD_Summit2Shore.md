# Technical Requirements Document (TRD)
## Summit2Shore Environmental Data Platform

**Document Version:** 1.0  
**Date:** November 2025  
**Related Documents:** BRD_Summit2Shore.md, FRD_Summit2Shore.md

---

## 1. Technical Overview

### 1.1 System Architecture
Summit2Shore follows a three-tier architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION TIER                         │
│  React SPA (Vite) + Tailwind CSS + shadcn/ui               │
│  Deployed: ~/www-root/ (Apache serves static files)        │
└─────────────────────────────────────────────────────────────┘
                              ↕ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION TIER                          │
│  Node.js + Express API Server (Port 3001)                   │
│  Deployed: ~/api/ (PM2 process manager)                     │
│  Proxied via Apache mod_rewrite                             │
└─────────────────────────────────────────────────────────────┘
                              ↕ MySQL
┌─────────────────────────────────────────────────────────────┐
│                       DATA TIER                              │
│  MySQL 8.0+ (web5.uvm.edu:3306)                            │
│  4 Databases: Raw, Initial Clean, Final Clean, Seasonal    │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

**Frontend:**
- React 18.3.1 (UI library)
- TypeScript 5.x (Type safety)
- Vite 5.x (Build tool)
- React Router DOM 6.30.1 (Client-side routing)
- Tailwind CSS 3.x (Utility-first styling)
- shadcn/ui (Component library)

**Backend:**
- Node.js 14+ (Runtime)
- Express 4.x (Web framework)
- MySQL2 (Database driver with Promise support)
- PM2 (Process manager)

**Data Visualization:**
- Recharts 2.15.4 (Charts)
- Leaflet 1.9.4 (Maps)
- Mapbox GL 3.14.0 (Advanced mapping)
- React Leaflet 4.2.1 (React integration)

**Development Tools:**
- ESLint (Code linting)
- TypeScript compiler
- Git (Version control)

---

## 2. Infrastructure Architecture

### 2.1 Production Servers

#### Primary Production: vdondeti.w3.uvm.edu
```
Server: vdondeti.w3.uvm.edu
OS: Linux (CentOS/RHEL)
User: vdondeti

Directory Structure:
~/
├── site-src/                 # Git repository (source code)
│   ├── src/                  # React source
│   ├── public/               # Public assets
│   ├── package.json          # Frontend dependencies
│   ├── vite.config.ts        # Vite build config
│   ├── production-api-server.js
│   └── production-package.json
│
├── api/                      # Backend API (production)
│   ├── production-api-server.js
│   ├── package.json
│   ├── node_modules/
│   └── [PM2 runtime files]
│
└── www-root/                 # Frontend build (Apache serves this)
    ├── index.html
    ├── assets/               # Bundled JS/CSS
    ├── lovable-uploads/      # User-uploaded images
    └── .htaccess             # Apache rewrite rules
```

#### Secondary Production: crrels2s.w3.uvm.edu
```
Server: crrels2s.w3.uvm.edu
OS: Linux (CentOS/RHEL)
User: crrels2s

Directory Structure: (Same as vdondeti.w3.uvm.edu)
~/
├── site-src/
├── api/
└── www-root/
```

### 2.2 Database Server
```
Server: web5.uvm.edu
Port: 3306
Engine: MySQL 8.0+

Credentials:
- User: crrels2s_admin (read-only for API)
- Password: [Stored in production environment]

Databases:
1. CRRELS2S_VTClimateRepository (Raw Data)
2. CRRELS2S_VTClimateRepository_Processed (Initial Clean)
3. CRRELS2S_ProcessedData (Final Clean)
4. CRRELS2S_cleaned_data_seasons (Seasonal)
```

---

## 3. Frontend Architecture

### 3.1 Component Structure

```
src/
├── components/              # Reusable UI components
│   ├── ui/                  # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── select.tsx
│   │   └── [38 more components]
│   │
│   ├── Header.tsx           # Global navigation
│   ├── Footer.tsx           # Global footer
│   ├── Hero.tsx             # Homepage hero section
│   ├── DataMap.tsx          # Station mapping
│   ├── SnowDepthChart.tsx   # Snow analytics chart
│   ├── TimeSeriesComparison.tsx
│   ├── SeasonalCleanDataAnalysis.tsx
│   ├── DataDownload.tsx     # Download interface
│   ├── DynamicDataBrowser.tsx
│   └── [20+ more components]
│
├── pages/                   # Route-level pages
│   ├── Home.tsx
│   ├── Network.tsx
│   ├── Analytics.tsx
│   ├── AdvancedAnalytics.tsx
│   ├── SnowAnalytics.tsx
│   ├── DataDownload.tsx
│   ├── Research.tsx
│   ├── APIDocumentation.tsx
│   └── NotFound.tsx
│
├── services/                # API service layers
│   ├── dataDownloadService.ts
│   ├── analyticsService.ts
│   ├── localDatabaseService.ts
│   └── seasonalAnalyticsService.ts
│
├── hooks/                   # Custom React hooks
│   ├── useAnalyticsData.ts
│   ├── useDataDownload.ts
│   ├── useLocalDatabase.ts
│   ├── useOptimizedAnalytics.ts
│   ├── useSeasonalAnalytics.ts
│   └── useDeviceDetection.tsx
│
├── lib/                     # Utility functions
│   ├── apiConfig.ts         # API base URL configuration
│   └── utils.ts             # Tailwind utilities
│
├── App.tsx                  # Root component with routing
├── main.tsx                 # Entry point
└── index.css                # Global styles + design tokens
```

### 3.2 State Management
- **React Query**: Server state management and caching
- **React Hooks**: Local component state (useState, useEffect)
- **No Redux/Context**: Kept simple for current scale

### 3.3 Routing Strategy
```typescript
// Client-side routing with React Router
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/network" element={<Network />} />
  <Route path="/analytics" element={<Analytics />} />
  <Route path="/analytics/snow-depth" element={<SnowAnalytics />} />
  <Route path="/analytics/advanced" element={<AdvancedAnalytics />} />
  <Route path="/download" element={<DataDownload />} />
  <Route path="/research" element={<Research />} />
  <Route path="/documentation" element={<APIDocumentation />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

### 3.4 Build Configuration

**vite.config.ts**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'charts': ['recharts'],
          'maps': ['leaflet', 'react-leaflet', 'mapbox-gl'],
        },
      },
    },
  },
});
```

### 3.5 API Integration

**apiConfig.ts**
```typescript
export const getApiBaseUrl = (): string => {
  // 1. Runtime override via window.__APP_CONFIG__
  // 2. UVM domain detection
  // 3. Non-localhost production
  // 4. Local development fallback
  // 5. Default to vdondeti.w3.uvm.edu
};
```

**Dynamic API Resolution:**
- Development: `http://localhost:3001`
- Production (vdondeti): `https://vdondeti.w3.uvm.edu`
- Production (crrels2s): `https://crrels2s.w3.uvm.edu`

---

## 4. Backend Architecture

### 4.1 API Server Structure

**production-api-server.js**
```javascript
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

// Server configuration
const PORT = 3001;
const app = express();

// Middleware
app.use(cors({
  origin: [
    'https://www.uvm.edu',
    'https://vdondeti.w3.uvm.edu',
    'https://crrels2s.w3.uvm.edu',
    'http://localhost:5173'
  ],
  credentials: true
}));
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
  host: 'web5.uvm.edu',
  user: process.env.MYSQL_USER || 'crrels2s_admin',
  password: process.env.MYSQL_PASSWORD,
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: false
});
```

### 4.2 API Endpoints

| Method | Endpoint | Description | Response Time |
|--------|----------|-------------|---------------|
| GET | `/health` | Server health check | < 100ms |
| GET | `/api/databases` | List all databases | < 200ms |
| GET | `/api/databases/:db/tables` | List tables in database | < 300ms |
| GET | `/api/databases/:db/tables/:table/data` | Get table data | < 2s |
| GET | `/api/databases/:db/tables/:table/locations` | Get locations | < 500ms |
| GET | `/api/databases/:db/tables/:table/attributes` | Get attributes | < 500ms |
| GET | `/api/databases/:db/locations` | Get all locations | < 300ms |
| GET | `/api/databases/:db/tables/:table/download` | Download data | Streaming |

### 4.3 Database Connection Management

```javascript
// Database name mapping (support case variations)
const DATABASES = {
  'raw_data': 'CRRELS2S_VTClimateRepository',
  'Raw_Data': 'CRRELS2S_VTClimateRepository',
  'initial_clean_data': 'CRRELS2S_VTClimateRepository_Processed',
  'Initial_Clean_Data': 'CRRELS2S_VTClimateRepository_Processed',
  'final_clean_data': 'CRRELS2S_ProcessedData',
  'Final_Clean_Data': 'CRRELS2S_ProcessedData',
  'seasonal_clean_data': 'CRRELS2S_cleaned_data_seasons',
  'Seasonal_Clean_Data': 'CRRELS2S_cleaned_data_seasons'
};

// Connection with database selection
async function getConnectionWithDB(databaseKey) {
  const databaseName = DATABASES[databaseKey];
  const connection = await pool.getConnection();
  await connection.query(`USE \`${databaseName}\``);
  return { connection, databaseName };
}
```

### 4.4 Location Metadata
```javascript
const LOCATION_METADATA = {
  'RB01': { name: 'Mansfield East Ranch Brook 1', 
           latitude: 44.2619, longitude: -72.8081, elevation: 1200 },
  'RB02': { name: 'Mansfield East Ranch Brook 2', 
           latitude: 44.2625, longitude: -72.8075, elevation: 1180 },
  // ... 100+ more locations
};
```

### 4.5 Process Management

**PM2 Configuration:**
```bash
# Start API server
pm2 start production-api-server.js --name "summit2shore-api"

# Auto-restart on crash
pm2 startup
pm2 save

# Monitoring
pm2 status
pm2 logs summit2shore-api
pm2 monit
```

**PM2 Features:**
- Auto-restart on crashes
- Log management (stdout/stderr)
- Memory/CPU monitoring
- Cluster mode support (future)

---

## 5. Database Schema

### 5.1 Database Overview

**Database 1: CRRELS2S_VTClimateRepository (Raw Data)**
- **Purpose:** Unprocessed sensor readings
- **Tables:** 100+ tables (one per location: RB01, RB02, etc.)
- **Update Frequency:** Every 15 minutes
- **Data Retention:** All historical data from 2010+

**Table Structure (Example: RB01)**
```sql
CREATE TABLE RB01 (
  id INT AUTO_INCREMENT PRIMARY KEY,
  timestamp DATETIME NOT NULL,
  air_temperature FLOAT,
  relative_humidity FLOAT,
  precipitation FLOAT,
  snow_depth FLOAT,
  wind_speed FLOAT,
  wind_direction INT,
  solar_radiation FLOAT,
  soil_temperature FLOAT,
  soil_moisture FLOAT,
  battery_voltage FLOAT,
  INDEX idx_timestamp (timestamp)
);
```

**Database 2: CRRELS2S_VTClimateRepository_Processed (Initial Clean)**
- **Purpose:** First-stage data cleaning (outlier removal)
- **Tables:** Same structure as raw data
- **Processing:** Automated QC scripts remove obvious sensor errors

**Database 3: CRRELS2S_ProcessedData (Final Clean)**
- **Purpose:** Fully validated and quality-controlled data
- **Tables:** Same structure as raw data
- **Processing:** Advanced QC algorithms, manual validation

**Database 4: CRRELS2S_cleaned_data_seasons (Seasonal)**
- **Purpose:** Seasonal aggregations for climate analysis
- **Tables:** Organized by location and season
- **Aggregations:** Min, max, mean, median per season

### 5.2 Data Types & Attributes

| Attribute | Unit | Data Type | Range | Null Allowed |
|-----------|------|-----------|-------|--------------|
| timestamp | UTC datetime | DATETIME | 2010-present | No |
| air_temperature | °C | FLOAT | -50 to 50 | Yes |
| relative_humidity | % | FLOAT | 0 to 100 | Yes |
| precipitation | mm | FLOAT | 0 to 500 | Yes |
| snow_depth | cm | FLOAT | 0 to 500 | Yes |
| wind_speed | m/s | FLOAT | 0 to 50 | Yes |
| wind_direction | degrees | INT | 0 to 360 | Yes |
| solar_radiation | W/m² | FLOAT | 0 to 1500 | Yes |
| soil_temperature | °C | FLOAT | -20 to 40 | Yes |
| soil_moisture | % | FLOAT | 0 to 100 | Yes |
| battery_voltage | V | FLOAT | 0 to 15 | Yes |

### 5.3 Query Optimization

**Indexes:**
- Primary key on `id`
- Index on `timestamp` for time-range queries
- Composite indexes for frequent filters (future)

**Query Performance:**
```sql
-- Optimized time-range query
SELECT * FROM RB01 
WHERE timestamp BETWEEN '2024-01-01' AND '2024-12-31'
ORDER BY timestamp ASC
LIMIT 10000;

-- Execution time: < 500ms for 1 year of data
```

**Connection Pooling:**
- Pool size: 10 connections
- Connection timeout: 30 seconds
- Query timeout: 60 seconds

---

## 6. Deployment Architecture

### 6.1 Apache Configuration

**VirtualHost Configuration:**
```apache
<VirtualHost *:443>
  ServerName vdondeti.w3.uvm.edu
  DocumentRoot /home/vdondeti/www-root
  
  SSLEngine on
  SSLCertificateFile /path/to/cert.pem
  SSLCertificateKeyFile /path/to/key.pem
  
  <Directory /home/vdondeti/www-root>
    AllowOverride All
    Require all granted
  </Directory>
</VirtualHost>
```

**~/.htaccess in www-root:**
```apache
RewriteEngine On
RewriteBase /

# Proxy API requests to Node.js backend
RewriteCond %{REQUEST_URI} ^/(health|api)
RewriteRule ^(.*)$ http://127.0.0.1:3001/$1 [P,L]

# Client-side routing for React SPA
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/(health|api)
RewriteRule . /index.html [L]

# Favicon redirect
RedirectMatch 302 ^/favicon\.ico$ /lovable-uploads/6cc4d90f-0179-494a-a8be-7a9a1c70a0e9.png
```

### 6.2 Build & Deployment Process

**Manual Deployment Steps:**
```bash
# 1. Connect to server
ssh vdondeti@vdondeti.w3.uvm.edu

# 2. Navigate to source directory
cd ~/site-src

# 3. Pull latest code (if using Git)
git pull origin main

# 4. Install dependencies (if package.json changed)
npm install

# 5. Build frontend
npm run build

# 6. Deploy to www-root
cp -r dist/* ~/www-root/

# 7. Update API (if changed)
cp production-api-server.js ~/api/
cd ~/api
pm2 restart summit2shore-api

# 8. Verify deployment
curl https://vdondeti.w3.uvm.edu/health
```

**Automated Deployment Script:**
```bash
# deploy-dual.sh
#!/bin/bash
# Deploys to either/both production servers

SERVER=$1  # "dev", "production", or "both"

if [ "$SERVER" == "production" ] || [ "$SERVER" == "both" ]; then
  echo "Deploying to crrels2s.w3.uvm.edu..."
  # Build, SCP, restart PM2
fi

if [ "$SERVER" == "dev" ] || [ "$SERVER" == "both" ]; then
  echo "Deploying to vdondeti.w3.uvm.edu..."
  # Build, SCP, restart PM2
fi
```

### 6.3 Environment Variables

**Production Environment:**
```bash
# ~/.bashrc or ~/.bash_profile
export MYSQL_USER="crrels2s_admin"
export MYSQL_PASSWORD="[REDACTED]"
export MYSQL_HOST="web5.uvm.edu"
export MYSQL_PORT="3306"
export NODE_ENV="production"
export PORT="3001"
```

---

## 7. Security Architecture

### 7.1 Authentication & Authorization
- **Current:** Read-only public access (no authentication)
- **Future:** OAuth2 + JWT for user authentication

### 7.2 Data Security
- **Encryption in Transit:** HTTPS (TLS 1.2+)
- **Encryption at Rest:** MySQL encryption (server-level)
- **Database Access:** Read-only credentials for API
- **Secrets Management:** Environment variables (not in code)

### 7.3 Input Validation
```javascript
// Parameterized queries prevent SQL injection
const query = 'SELECT * FROM ?? WHERE timestamp BETWEEN ? AND ?';
const [rows] = await connection.execute(query, 
  [tableName, startDate, endDate]
);

// No user input directly in SQL strings
```

### 7.4 Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // 1000 requests per hour
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);
```

### 7.5 CORS Policy
```javascript
// Restrict API access to approved domains
const allowedOrigins = [
  'https://www.uvm.edu',
  'https://vdondeti.w3.uvm.edu',
  'https://crrels2s.w3.uvm.edu',
  'http://localhost:5173' // Development only
];
```

---

## 8. Monitoring & Logging

### 8.1 Application Logging
```javascript
// Console logging with timestamps
console.log(`[${new Date().toISOString()}] API REQUEST: ${req.method} ${req.url}`);
console.error(`[${new Date().toISOString()}] ERROR:`, error);

// PM2 log management
pm2 logs summit2shore-api --lines 100
pm2 logs summit2shore-api --err --lines 50
```

### 8.2 Performance Monitoring
```javascript
// Request timing middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${duration}ms`);
  });
  next();
});
```

### 8.3 Health Checks
```javascript
// Health endpoint with database check
app.get('/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    connection.release();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

### 8.4 Error Tracking
- **Console Errors:** Logged by PM2
- **Client Errors:** Browser console (future: Sentry integration)
- **API Errors:** Structured JSON responses with error codes

---

## 9. Performance Optimization

### 9.1 Frontend Optimization
- **Code Splitting:** React.lazy() for route-based chunks
- **Tree Shaking:** Unused code removed by Vite
- **Minification:** CSS/JS minified in production build
- **Image Optimization:** Lazy loading with `loading="lazy"`
- **Caching:** React Query for server state caching

### 9.2 Backend Optimization
- **Connection Pooling:** Reuse database connections
- **Query Optimization:** Indexed columns, LIMIT clauses
- **Streaming:** Stream large datasets instead of buffering
- **Compression:** Gzip responses (Apache mod_deflate)

### 9.3 Database Optimization
- **Indexes:** Timestamp, location columns indexed
- **Query Caching:** MySQL query cache enabled
- **Partitioning:** Consider partitioning by year (future)
- **Read Replicas:** Scale reads independently (future)

---

## 10. Backup & Recovery

### 10.1 Backup Strategy
**Database Backups:**
- **Frequency:** Daily automated backups
- **Retention:** 30 days
- **Location:** UVM IT managed backup storage
- **Method:** mysqldump full database backups

**Application Backups:**
```bash
# Frontend build backup
cp -r ~/www-root ~/backup-www-root-$(date +%F)

# API server backup
cp -r ~/api ~/backup-api-$(date +%F)

# Source code backup (Git repository)
git push origin main  # Remote backup
```

### 10.2 Disaster Recovery
1. **Database Failure:** Restore from latest mysqldump backup
2. **API Server Failure:** PM2 auto-restart, manual restart if needed
3. **Frontend Corruption:** Rebuild from source, redeploy to www-root
4. **Server Failure:** Migrate to secondary server (crrels2s or vdondeti)

**Recovery Time Objective (RTO):** 4 hours  
**Recovery Point Objective (RPO):** 24 hours

---

## 11. Development Workflow

### 11.1 Local Development Setup
```bash
# Clone repository
git clone <repository-url>
cd summit2shore

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend runs on http://localhost:5173
# API server should be running separately on localhost:3001
```

### 11.2 Development Environment
- **OS:** macOS, Linux, Windows (WSL recommended)
- **Node.js:** 14+ (use nvm for version management)
- **Editor:** VS Code recommended with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript

### 11.3 Git Workflow
```bash
# Feature branch workflow
git checkout -b feature/new-analytics-chart
# ... make changes ...
git add .
git commit -m "Add snow accumulation chart"
git push origin feature/new-analytics-chart
# Create pull request for review
```

### 11.4 Testing Strategy
- **Manual Testing:** Browser-based testing of features
- **API Testing:** Postman/curl for endpoint validation
- **Cross-Browser:** Chrome, Firefox, Safari, Edge
- **Mobile Testing:** Responsive design testing on devices

---

## 12. Deployment Environments

| Environment | Server | URL | Purpose | Database |
|-------------|--------|-----|---------|----------|
| **Development** | Local | localhost:5173 | Development & testing | web5.uvm.edu (read-only) |
| **Production 1** | vdondeti.w3.uvm.edu | https://vdondeti.w3.uvm.edu | Primary production | web5.uvm.edu |
| **Production 2** | crrels2s.w3.uvm.edu | https://crrels2s.w3.uvm.edu | Secondary production | web5.uvm.edu (shared) |

---

## 13. Technology Decisions & Rationale

### 13.1 Why React?
- **Component Reusability:** Build once, use everywhere
- **Large Ecosystem:** Rich library support (Recharts, Leaflet)
- **Performance:** Virtual DOM for efficient updates
- **Developer Experience:** Strong TypeScript support

### 13.2 Why Vite?
- **Fast Dev Server:** Hot Module Replacement (HMR) in milliseconds
- **Optimized Builds:** Tree-shaking, code-splitting out of the box
- **Modern:** Native ES modules, optimized for React

### 13.3 Why Node.js + Express for API?
- **JavaScript Everywhere:** Same language as frontend
- **Non-Blocking I/O:** Handle concurrent requests efficiently
- **Lightweight:** Minimal overhead for API server
- **npm Ecosystem:** mysql2, cors, express middleware

### 13.4 Why MySQL?
- **Existing Infrastructure:** UVM uses MySQL (web5.uvm.edu)
- **Relational Data:** Structured time-series data fits well
- **Proven Performance:** Handles millions of rows efficiently
- **SQL Familiarity:** Research team knows SQL

### 13.5 Why Not PostgreSQL/MongoDB?
- **PostgreSQL:** Would require new infrastructure setup
- **MongoDB:** Relational structure better fits our time-series data
- **Decision:** Stick with existing UVM MySQL infrastructure

---

## 14. Scalability Considerations

### 14.1 Current Limitations
- **Single API Server:** No load balancing (PM2 cluster mode future)
- **Single Database:** No read replicas (web5.uvm.edu shared)
- **Manual Deployment:** No CI/CD pipeline

### 14.2 Future Scaling Options
1. **Horizontal Scaling:**
   - Deploy multiple API servers behind load balancer
   - PM2 cluster mode (use all CPU cores)
   - CDN for static assets (CloudFlare, etc.)

2. **Database Scaling:**
   - MySQL read replicas for query distribution
   - Table partitioning by year or location
   - Consider TimescaleDB for time-series optimization

3. **Caching Layer:**
   - Redis for API response caching
   - Cache frequently accessed datasets
   - Cache database metadata (tables, locations)

4. **Microservices (if needed):**
   - Separate analytics service
   - Separate download service
   - Message queue for bulk requests

---

## 15. Maintenance & Support

### 15.1 Routine Maintenance
- **Weekly:** Review PM2 logs for errors
- **Monthly:** Check database growth, optimize if needed
- **Quarterly:** Update npm dependencies
- **Annually:** Review and renew SSL certificates

### 15.2 Dependency Updates
```bash
# Check outdated packages
npm outdated

# Update minor versions
npm update

# Update major versions (test thoroughly)
npm install react@latest react-dom@latest
```

### 15.3 Troubleshooting Guides
See `LOCAL_SETUP_GUIDE.md`, `DEPLOY_TO_PRODUCTION.md` for common issues and solutions.

---

## 16. Compliance & Standards

### 16.1 Web Standards
- **HTML5:** Semantic markup
- **CSS3:** Modern layout (Flexbox, Grid)
- **ES6+:** Modern JavaScript features
- **REST API:** RESTful design principles

### 16.2 Accessibility
- **WCAG 2.1 Level AA:** Target compliance
- **Keyboard Navigation:** All interactive elements accessible
- **Screen Readers:** Proper ARIA labels

### 16.3 Security Standards
- **HTTPS Only:** Enforce encrypted connections
- **OWASP Top 10:** Follow security best practices
- **Input Validation:** Sanitize all user inputs
- **SQL Injection Prevention:** Parameterized queries

---

## 17. Documentation

### 17.1 Documentation Structure
```
docs/
├── BRD_Summit2Shore.md           # Business requirements
├── FRD_Summit2Shore.md           # Functional requirements
├── TRD_Summit2Shore.md           # Technical requirements (this doc)
├── LOCAL_SETUP_GUIDE.md          # Deployment from scratch
├── DEPLOY_TO_PRODUCTION.md       # Production deployment
├── INSTALLATION_PREREQUISITES.md # Software installation
├── QUICKSTART_PRODUCTION_DEPLOYMENT.md
├── DATABASE_SETUP.md
├── DATA_DOWNLOAD_FEATURE.md
├── PRODUCTION_API_GUIDE.md
└── COMPREHENSIVE_HOSTING_GUIDE.md
```

### 17.2 API Documentation
- **Location:** `/documentation` route in application
- **Format:** Interactive documentation with examples
- **Maintenance:** Update when API changes

---

## 18. Future Technical Enhancements

### 18.1 Short-Term (Q1 2026)
- [ ] Implement CI/CD pipeline (GitHub Actions)
- [ ] Add API response caching (Redis)
- [ ] Implement comprehensive error tracking (Sentry)
- [ ] Add unit tests for critical components

### 18.2 Mid-Term (Q2-Q3 2026)
- [ ] User authentication system (OAuth2 + JWT)
- [ ] API key management for rate limiting
- [ ] Database read replicas for scaling
- [ ] Progressive Web App (PWA) features

### 18.3 Long-Term (Q4 2026+)
- [ ] Machine learning predictions (ML models)
- [ ] Real-time WebSocket updates
- [ ] Mobile native applications (React Native)
- [ ] Advanced analytics engine
- [ ] Data ingestion pipeline for researchers

---

## 19. Appendices

### Appendix A: Server Specifications
```
Server: vdondeti.w3.uvm.edu / crrels2s.w3.uvm.edu
OS: Linux (CentOS/RHEL)
CPU: [TBD]
RAM: [TBD]
Storage: [TBD]
Network: UVM internal network
```

### Appendix B: Port Assignments
- **80:** HTTP (redirects to HTTPS)
- **443:** HTTPS (Apache)
- **3001:** API Server (Node.js/Express, local only)
- **3306:** MySQL (web5.uvm.edu)

### Appendix C: DNS Configuration
```
vdondeti.w3.uvm.edu  → 132.198.x.x (UVM DNS)
crrels2s.w3.uvm.edu  → 132.198.x.x (UVM DNS)
```

### Appendix D: SSL Certificate
- **Type:** UVM-issued SSL certificate
- **Provider:** InCommon/Sectigo
- **Renewal:** Annually via UVM IT

---

## 20. Glossary

- **API:** Application Programming Interface
- **SPA:** Single Page Application
- **REST:** Representational State Transfer
- **CORS:** Cross-Origin Resource Sharing
- **PM2:** Process Manager 2 (Node.js daemon)
- **HMR:** Hot Module Replacement
- **ORM:** Object-Relational Mapping (not used in this project)
- **JWT:** JSON Web Token
- **CDN:** Content Delivery Network
- **PWA:** Progressive Web App

---

**Document Control**
- **Version**: 1.0
- **Last Updated**: November 2025
- **Next Review**: February 2026
- **Owner**: Development Team
- **Approvers**: CRRELS Technical Lead, UVM IT
