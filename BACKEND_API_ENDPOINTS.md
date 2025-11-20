# Backend API Endpoints Documentation

This document outlines all the backend API endpoints required for the Summit2Shore Environmental Data Portal. Your production API server at `crrels2s.w3.uvm.edu` should implement these endpoints.

## Base URL
All endpoints are relative to: `https://crrels2s.w3.uvm.edu`

## Table of Contents
1. [Authentication Endpoints](#authentication-endpoints)
2. [Database Discovery Endpoints](#database-discovery-endpoints)
3. [Data Download Endpoints](#data-download-endpoints)
4. [API Key Management Endpoints](#api-key-management-endpoints)
5. [Health & Status Endpoints](#health--status-endpoints)

---

## 1. Authentication Endpoints

See `AUTHENTICATION_SETUP.md` for complete authentication setup guide including database schema.

### POST /auth/signup
Create a new user account.

**Request Body:**
```json
{
  "email": "researcher@university.edu",
  "password": "secure_password",
  "full_name": "Dr. Jane Smith",
  "organization": "University of Vermont"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "uuid",
    "email": "researcher@university.edu",
    "full_name": "Dr. Jane Smith"
  }
}
```

### POST /auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "researcher@university.edu",
  "password": "secure_password"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "researcher@university.edu",
    "full_name": "Dr. Jane Smith",
    "organization": "University of Vermont",
    "roles": ["user"]
  }
}
```

### GET /auth/verify
Verify JWT token and return user info.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "researcher@university.edu",
    "full_name": "Dr. Jane Smith",
    "roles": ["user"]
  }
}
```

---

## 2. Database Discovery Endpoints

These endpoints provide metadata about available databases, tables, and their attributes.

### GET /api/databases
List all available databases.

**Response (200 OK):**
```json
{
  "success": true,
  "databases": [
    {
      "key": "CRRELS2S_seasonal_qaqc_data",
      "name": "CRRELS2S_seasonal_qaqc_data",
      "displayName": "Seasonal QA/QC Data",
      "display_name": "Seasonal QA/QC Data",
      "description": "Quality-assured seasonal environmental data",
      "category": "seasonal",
      "order": 1
    },
    {
      "key": "CRRELS2S_raw_data",
      "name": "CRRELS2S_raw_data",
      "displayName": "Raw Sensor Data",
      "display_name": "Raw Sensor Data",
      "description": "Unprocessed data from environmental sensors",
      "category": "raw",
      "order": 2
    }
  ]
}
```

### GET /api/databases/:databaseId/tables
List all tables in a specific database.

**Path Parameters:**
- `databaseId`: Database identifier (e.g., "CRRELS2S_seasonal_qaqc_data")

**Response (200 OK):**
```json
{
  "success": true,
  "tables": [
    {
      "name": "Season_2023_2024",
      "displayName": "2023-2024 Season",
      "display_name": "2023-2024 Season",
      "description": "Environmental data from 2023-2024 winter season",
      "rowCount": 145823,
      "row_count": 145823
    },
    {
      "name": "Season_2022_2023",
      "displayName": "2022-2023 Season",
      "display_name": "2022-2023 Season",
      "description": "Environmental data from 2022-2023 winter season",
      "rowCount": 132456,
      "row_count": 132456
    }
  ]
}
```

### GET /api/databases/:databaseId/tables/:tableName/attributes
Get column/attribute information for a specific table.

**Path Parameters:**
- `databaseId`: Database identifier
- `tableName`: Table name

**Response (200 OK):**
```json
{
  "success": true,
  "attributes": [
    {
      "name": "TIMESTAMP",
      "column_name": "TIMESTAMP",
      "type": "datetime",
      "data_type": "datetime",
      "category": "timestamp",
      "isPrimary": true,
      "is_primary": true,
      "nullable": false,
      "comment": "Date and time of measurement"
    },
    {
      "name": "Location",
      "column_name": "Location",
      "type": "varchar",
      "data_type": "varchar(100)",
      "category": "location",
      "isPrimary": true,
      "is_primary": true,
      "nullable": false,
      "comment": "Measurement location identifier"
    },
    {
      "name": "Air_Temp_C",
      "column_name": "Air_Temp_C",
      "type": "decimal",
      "data_type": "decimal(5,2)",
      "category": "temperature",
      "isPrimary": false,
      "is_primary": false,
      "nullable": true,
      "comment": "Air temperature in Celsius"
    },
    {
      "name": "Snow_Depth_cm",
      "column_name": "Snow_Depth_cm",
      "type": "decimal",
      "data_type": "decimal(6,2)",
      "category": "snow",
      "isPrimary": false,
      "is_primary": false,
      "nullable": true,
      "comment": "Snow depth in centimeters"
    }
  ]
}
```

### GET /api/databases/:databaseId/tables/:tableName/locations
Get available location values for a specific table.

**Path Parameters:**
- `databaseId`: Database identifier
- `tableName`: Table name

**Response (200 OK):**
```json
{
  "success": true,
  "locations": [
    "Bolton Valley",
    "Smugglers Notch",
    "Mount Mansfield",
    "Stowe Mountain",
    "Jay Peak"
  ]
}
```

Alternative format with metadata:
```json
{
  "success": true,
  "locations": [
    {
      "id": 1,
      "name": "Bolton Valley",
      "displayName": "Bolton Valley Research Station",
      "latitude": 44.4012,
      "longitude": -72.8698,
      "elevation": 950
    }
  ]
}
```

---

## 3. Data Download Endpoints

### GET /api/databases/:databaseId/download/:tableName
Download filtered data in CSV or Excel format.

**Path Parameters:**
- `databaseId`: Database identifier
- `tableName`: Table name

**Query Parameters:**
- `start_date` (required): Start date in YYYY-MM-DD format
- `end_date` (required): End date in YYYY-MM-DD format
- `locations` (required): Comma-separated location names
- `attributes` (optional): Comma-separated attribute names (if not provided, return all)
- `format` (optional): "csv" or "excel" (default: "csv")

**Example Request:**
```
GET /api/databases/CRRELS2S_seasonal_qaqc_data/download/Season_2023_2024?start_date=2024-01-01&end_date=2024-01-31&locations=Bolton%20Valley,Jay%20Peak&attributes=TIMESTAMP,Air_Temp_C,Snow_Depth_cm&format=excel
```

**Response (200 OK):**
- Content-Type: `text/csv` or `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Content-Disposition: `attachment; filename="data_export.csv"` or `.xlsx`
- Body: File stream

**CSV Format:**
```csv
TIMESTAMP,Location,Air_Temp_C,Snow_Depth_cm
2024-01-01 00:00:00,Bolton Valley,-5.2,45.3
2024-01-01 01:00:00,Bolton Valley,-5.8,45.5
...
```

**Excel Format:**
The Excel file should contain two sheets:

**Sheet 1: "Metadata"**
```
Summit2Shore Environmental Data Export

Export Information
Database: Seasonal QA/QC Data
Table: 2023-2024 Season
Export Date: 2024-11-20T15:30:00Z
Total Records: 1523
Date Range: 2024-01-01 to 2024-01-31
Locations: Bolton Valley, Jay Peak

Data Dictionary
Column Name | Description
TIMESTAMP | Date and time of measurement
Location | Measurement location identifier
Air_Temp_C | Air temperature in Celsius
Snow_Depth_cm | Snow depth in centimeters
```

**Sheet 2: "Data"**
Same as CSV format but in Excel format with proper column widths.

### GET /api/databases/:databaseId/data/:tableName
Preview data (limited rows for testing).

**Query Parameters:**
Same as download endpoint plus:
- `limit` (optional): Maximum number of rows (default: 100)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "TIMESTAMP": "2024-01-01T00:00:00Z",
      "Location": "Bolton Valley",
      "Air_Temp_C": -5.2,
      "Snow_Depth_cm": 45.3
    }
  ],
  "totalRecords": 1523,
  "previewLimit": 100
}
```

---

## 4. API Key Management Endpoints

All endpoints require `Authorization: Bearer <jwt_token>` header.

### GET /api-keys
List all API keys for the authenticated user.

**Response (200 OK):**
```json
{
  "success": true,
  "keys": [
    {
      "id": "uuid",
      "name": "My Research Project",
      "key_prefix": "s2s_abc123",
      "description": "Used for snow depth analysis",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "last_used_at": "2024-01-20T14:22:00Z",
      "total_requests": 1523,
      "rate_limit_per_hour": 1000,
      "rate_limit_per_day": 10000,
      "expires_at": null,
      "allowed_databases": ["CRRELS2S_seasonal_qaqc_data"]
    }
  ]
}
```

### POST /api-keys
Generate a new API key.

**Request Body:**
```json
{
  "name": "My Research Project",
  "description": "Used for analyzing snow depth patterns",
  "rate_limit_per_hour": 1000,
  "rate_limit_per_day": 10000,
  "allowed_databases": ["CRRELS2S_seasonal_qaqc_data"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "api_key": "s2s_abc123def456ghi789jkl012mno345pqr678stu901",
  "key_id": "uuid",
  "message": "API key created successfully. Save this key - you won't see it again!"
}
```

**Important Implementation Notes:**
- Generate a secure random string (40-64 characters) prefixed with `s2s_`
- Store only the hashed version (using bcrypt) in the database
- Return the full key only once on creation
- The frontend will never see the full key again after creation

### DELETE /api-keys/:keyId
Revoke an API key.

**Path Parameters:**
- `keyId`: API key UUID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "API key revoked successfully"
}
```

### GET /api-keys/:keyId/usage
Get detailed usage statistics for an API key.

**Path Parameters:**
- `keyId`: API key UUID

**Query Parameters:**
- `start_date` (optional): ISO date string
- `end_date` (optional): ISO date string
- `limit` (optional): Number of records to return (default: 100)

**Response (200 OK):**
```json
{
  "success": true,
  "usage": [
    {
      "timestamp": "2024-01-20T14:22:00Z",
      "endpoint": "/api/databases/CRRELS2S_seasonal_qaqc_data/download/Season_2023_2024",
      "method": "GET",
      "status_code": 200,
      "response_time_ms": 145,
      "database_accessed": "CRRELS2S_seasonal_qaqc_data",
      "table_accessed": "Season_2023_2024",
      "records_returned": 1250
    }
  ],
  "summary": {
    "total_requests": 1523,
    "current_hourly_usage": 45,
    "current_daily_usage": 320,
    "hourly_limit": 1000,
    "daily_limit": 10000,
    "hourly_remaining": 955,
    "daily_remaining": 9680
  }
}
```

---

## 5. Health & Status Endpoints

### GET /api/health
Check API health status.

**Response (200 OK):**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-11-20T15:30:00Z",
  "version": "1.0.0",
  "database": {
    "connected": true,
    "response_time_ms": 12
  }
}
```

### GET /api/status
Get detailed system status (admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "uptime_seconds": 86400,
  "active_users": 42,
  "total_api_keys": 156,
  "requests_last_hour": 2341,
  "requests_last_24h": 45230,
  "database_connections": {
    "active": 12,
    "idle": 8,
    "max": 20
  }
}
```

---

## Security & Implementation Notes

### API Key Authentication Middleware

For data download endpoints, implement API key validation:

```javascript
async function validateAPIKey(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      error: 'Missing API key' 
    });
  }

  const apiKey = authHeader.substring(7);
  
  // Hash and look up key
  const keyRecord = await db.query(
    'SELECT * FROM api_keys WHERE key_hash = ? AND is_active = TRUE',
    [await bcrypt.hash(apiKey, 10)]
  );

  if (!keyRecord) {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid or inactive API key' 
    });
  }

  // Check rate limits
  const rateLimitStatus = await checkRateLimits(keyRecord.id);
  
  if (rateLimitStatus.exceeded) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded',
      limit: rateLimitStatus.limit,
      reset_at: rateLimitStatus.reset_at,
      retry_after: rateLimitStatus.retry_after_seconds
    });
  }

  // Log usage
  await logAPIUsage(keyRecord.id, req);
  
  req.apiKey = keyRecord;
  next();
}
```

### Rate Limiting Implementation

```javascript
async function checkRateLimits(apiKeyId) {
  const now = new Date();
  const hourWindow = new Date(now.setMinutes(0, 0, 0));
  const dayWindow = now.toISOString().split('T')[0];

  // Get or create tracking record
  let tracking = await db.query(
    'SELECT * FROM rate_limit_tracking WHERE api_key_id = ? AND (hour_window = ? OR day_window = ?)',
    [apiKeyId, hourWindow, dayWindow]
  );

  // Check if limits exceeded
  const hourlyExceeded = tracking.hourly_count >= apiKey.rate_limit_per_hour;
  const dailyExceeded = tracking.daily_count >= apiKey.rate_limit_per_day;

  if (hourlyExceeded || dailyExceeded) {
    return {
      exceeded: true,
      limit: hourlyExceeded ? 'hourly' : 'daily',
      reset_at: hourlyExceeded 
        ? new Date(hourWindow.getTime() + 3600000).toISOString()
        : new Date(dayWindow + 'T23:59:59Z').toISOString(),
      retry_after_seconds: hourlyExceeded ? 3600 : 86400
    };
  }

  // Increment counters
  await db.query(
    'UPDATE rate_limit_tracking SET hourly_count = hourly_count + 1, daily_count = daily_count + 1 WHERE api_key_id = ?',
    [apiKeyId]
  );

  return { exceeded: false };
}
```

### CORS Configuration

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'https://crrels2s.w3.uvm.edu',
    'http://localhost:5173'  // For local development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Error Response Format

All errors should follow this format:

```json
{
  "success": false,
  "error": "Error message here",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional context"
  }
}
```

Common error codes:
- `INVALID_CREDENTIALS` - Authentication failed
- `UNAUTHORIZED` - Missing or invalid token/API key
- `FORBIDDEN` - Insufficient permissions
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `VALIDATION_ERROR` - Invalid input parameters
- `NOT_FOUND` - Resource not found
- `DATABASE_ERROR` - Database operation failed
- `INTERNAL_ERROR` - Unexpected server error

---

## Testing Your API

### Test Database Discovery:
```bash
curl https://crrels2s.w3.uvm.edu/api/databases

curl https://crrels2s.w3.uvm.edu/api/databases/CRRELS2S_seasonal_qaqc_data/tables

curl https://crrels2s.w3.uvm.edu/api/databases/CRRELS2S_seasonal_qaqc_data/tables/Season_2023_2024/attributes
```

### Test Authentication:
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

### Test Data Download:
```bash
curl -O "https://crrels2s.w3.uvm.edu/api/databases/CRRELS2S_seasonal_qaqc_data/download/Season_2023_2024?start_date=2024-01-01&end_date=2024-01-31&locations=Bolton%20Valley&format=csv"
```

---

## Database Schema Reference

See `AUTHENTICATION_SETUP.md` for complete database schema including:
- users
- user_sessions  
- user_roles
- profiles
- api_keys
- api_key_usage
- rate_limit_tracking
