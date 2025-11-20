# Quick Setup Guide for Summit2Shore Portal

## Overview
This guide provides a quick reference for setting up the Summit2Shore Environmental Data Portal with your backend at `crrels2s.w3.uvm.edu`.

## 📋 Prerequisites

1. **MySQL Database** at crrels2s.w3.uvm.edu
2. **Node.js** server capable of handling REST API requests
3. **HTTPS** configured for production
4. **CORS** enabled for your frontend domain

## 🗄️ Database Setup

### Step 1: Create Authentication Tables
```sql
-- Run the SQL scripts from AUTHENTICATION_SETUP.md
-- This creates: users, user_sessions, user_roles tables
```

### Step 2: Create API Key Management Tables
```sql
-- Run the SQL scripts from BACKEND_API_ENDPOINTS.md
-- This creates: profiles, api_keys, api_key_usage, rate_limit_tracking tables
```

## 🔌 Required API Endpoints

Your backend must implement these endpoints (see BACKEND_API_ENDPOINTS.md for details):

### Authentication
- ✅ `POST /auth/signup` - User registration
- ✅ `POST /auth/login` - User login
- ✅ `GET /auth/verify` - Token verification
- ✅ `POST /auth/logout` - User logout
- ✅ `GET /auth/profile` - Get user profile
- ✅ `PUT /auth/profile` - Update user profile

### Database Discovery
- ✅ `GET /api/databases` - List all databases
- ✅ `GET /api/databases/:databaseId/tables` - List tables
- ✅ `GET /api/databases/:databaseId/tables/:tableName/attributes` - Get columns
- ✅ `GET /api/databases/:databaseId/tables/:tableName/locations` - Get locations

### Data Download
- ✅ `GET /api/databases/:databaseId/download/:tableName` - Download data (CSV/Excel)
- ✅ `GET /api/databases/:databaseId/data/:tableName` - Preview data

### API Key Management
- ✅ `GET /api-keys` - List user's API keys
- ✅ `POST /api-keys` - Create new API key
- ✅ `DELETE /api-keys/:keyId` - Revoke API key
- ✅ `GET /api-keys/:keyId/usage` - Get usage statistics

### System
- ✅ `GET /api/health` - Health check

## 🎨 Frontend Features

### 1. Authentication System
- User signup and login pages
- JWT token management
- Protected routes
- Session persistence

### 2. Data Download Interface
- **4-Step Wizard:**
  1. Select Database (seasonal data selection)
  2. Select Table (dynamic table fetching)
  3. Apply Filters (locations, date range, attributes)
  4. Download (CSV or Excel format)

### 3. Format Options
- **CSV**: Standard comma-separated values
- **Excel**: Multi-sheet workbook with metadata

### 4. Metadata in Excel
When users select Excel format, the file includes:
- **Metadata Sheet**: Export details, date range, locations, data dictionary
- **Data Sheet**: Actual data with auto-sized columns

## 🔐 Security Implementation

### Password Hashing
```javascript
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash(password, 10);
```

### JWT Token Generation
```javascript
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { user_id: user.id, email: user.email, roles: user.roles },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```

### API Key Generation
```javascript
const crypto = require('crypto');
const apiKey = 's2s_' + crypto.randomBytes(32).toString('hex');
const keyHash = await bcrypt.hash(apiKey, 10); // Store only hash
```

## 📊 Data Response Formats

### Database List Response
```json
{
  "success": true,
  "databases": [
    {
      "key": "CRRELS2S_seasonal_qaqc_data",
      "displayName": "Seasonal QA/QC Data",
      "description": "Quality-assured seasonal environmental data"
    }
  ]
}
```

### Table List Response
```json
{
  "success": true,
  "tables": [
    {
      "name": "Season_2023_2024",
      "displayName": "2023-2024 Season",
      "description": "Environmental data from 2023-2024 winter season",
      "rowCount": 145823
    }
  ]
}
```

### Attributes Response
```json
{
  "success": true,
  "attributes": [
    {
      "name": "TIMESTAMP",
      "type": "datetime",
      "category": "timestamp",
      "isPrimary": true,
      "nullable": false,
      "comment": "Date and time of measurement"
    }
  ]
}
```

## 🚀 Testing Your Setup

### 1. Test Health Endpoint
```bash
curl https://crrels2s.w3.uvm.edu/api/health
```

### 2. Test Authentication
```bash
# Signup
curl -X POST https://crrels2s.w3.uvm.edu/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","full_name":"Test User"}'

# Login
curl -X POST https://crrels2s.w3.uvm.edu/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### 3. Test Database Discovery
```bash
# List databases
curl https://crrels2s.w3.uvm.edu/api/databases

# List tables
curl https://crrels2s.w3.uvm.edu/api/databases/CRRELS2S_seasonal_qaqc_data/tables

# Get attributes
curl https://crrels2s.w3.uvm.edu/api/databases/CRRELS2S_seasonal_qaqc_data/tables/Season_2023_2024/attributes
```

### 4. Test Data Download
```bash
curl -O "https://crrels2s.w3.uvm.edu/api/databases/CRRELS2S_seasonal_qaqc_data/download/Season_2023_2024?start_date=2024-01-01&end_date=2024-01-31&locations=Bolton%20Valley&format=csv"
```

## 📝 Frontend Configuration

The frontend is already configured to use `crrels2s.w3.uvm.edu` as the API base URL. This is determined automatically in `src/lib/apiConfig.ts`:

```typescript
// For production (uvm.edu domain)
if (hostname.includes('uvm.edu')) {
  return `https://${hostname}`;
}

// For localhost development
return import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

## ✅ Deployment Checklist

- [ ] MySQL database created with all required tables
- [ ] All API endpoints implemented
- [ ] HTTPS configured
- [ ] CORS configured for frontend domain
- [ ] Environment variables set (JWT_SECRET, DB credentials)
- [ ] Rate limiting implemented
- [ ] Error handling added
- [ ] Logging configured
- [ ] Password hashing with bcrypt
- [ ] API key generation working
- [ ] Authentication endpoints tested
- [ ] Data download endpoints tested
- [ ] Excel export working with metadata
- [ ] Health endpoint responding

## 📚 Documentation Files

- **AUTHENTICATION_SETUP.md** - Complete authentication guide with database schema
- **BACKEND_API_ENDPOINTS.md** - Full API endpoint specifications
- **QUICK_SETUP_GUIDE.md** - This file, quick reference
- **src/lib/apiConfig.ts** - Frontend API configuration
- **src/pages/Auth.tsx** - Authentication UI
- **src/pages/APIKeys.tsx** - API key management UI
- **src/components/EnhancedDataDownload.tsx** - Data download interface

## 🆘 Troubleshooting

### Issue: CORS errors
**Solution**: Configure CORS to allow your frontend domain
```javascript
app.use(cors({
  origin: ['https://crrels2s.w3.uvm.edu', 'http://localhost:5173'],
  credentials: true
}));
```

### Issue: "Invalid token" errors
**Solution**: Verify JWT secret matches and token hasn't expired

### Issue: Data download returns empty
**Solution**: Check that:
- Database connection is working
- Table and column names match exactly
- Date range contains data
- Locations exist in the database

### Issue: Excel download fails
**Solution**: Ensure server returns proper Content-Type:
```javascript
res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
```

## 💡 Tips

1. **Start with health endpoint** - Get this working first
2. **Test authentication** - Ensure signup/login works before other features
3. **Use Postman or curl** - Test each endpoint individually
4. **Check logs** - Enable detailed logging during setup
5. **Test with real data** - Use actual seasonal data for testing
6. **Excel metadata** - Backend should populate column descriptions in metadata

## 🔄 Next Steps

After basic setup:
1. Implement rate limiting for public endpoints
2. Add email verification (optional)
3. Set up monitoring and alerts
4. Configure backup procedures
5. Add API documentation UI (Swagger/OpenAPI)
6. Implement caching for frequently accessed data

## 📞 Support

For questions about:
- **Frontend**: Check component files and hooks in `src/`
- **API Specs**: See `BACKEND_API_ENDPOINTS.md`
- **Authentication**: See `AUTHENTICATION_SETUP.md`
- **Database Schema**: See SQL files in documentation
