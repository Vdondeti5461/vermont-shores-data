# Backend API Endpoints for API Key Management

This document outlines the backend endpoints you need to implement in your production API server to support the API key management system.

## Authentication Endpoints

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
  "message": "Account created successfully",
  "user_id": "uuid"
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
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "researcher@university.edu",
    "full_name": "Dr. Jane Smith",
    "organization": "University of Vermont",
    "role": "user"
  }
}
```

## API Key Management Endpoints

All endpoints require `Authorization: Bearer <jwt_token>` header.

### GET /api-keys
List all API keys for the authenticated user.

**Response (200 OK):**
```json
{
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
      "expires_at": null
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
  "allowed_databases": ["seasonal_qaqc_data"]
}
```

**Response (201 Created):**
```json
{
  "api_key": "s2s_abc123def456ghi789...",
  "key_id": "uuid",
  "message": "API key created successfully. Save this key - you won't see it again!"
}
```

**Important:** Generate a secure random string (e.g., 40-64 characters) prefixed with `s2s_`. Store only the hashed version (using bcrypt or similar) in the database. Return the full key only once on creation.

### DELETE /api-keys/:keyId
Revoke an API key.

**Response (200 OK):**
```json
{
  "message": "API key revoked successfully"
}
```

### GET /api-keys/:keyId/usage
Get detailed usage statistics for an API key.

**Query Parameters:**
- `start_date` (optional): ISO date string
- `end_date` (optional): ISO date string

**Response (200 OK):**
```json
{
  "usage": [
    {
      "timestamp": "2024-01-20T14:22:00Z",
      "endpoint": "/data",
      "method": "GET",
      "status_code": 200,
      "response_time_ms": 145,
      "database_accessed": "seasonal_qaqc_data",
      "records_returned": 1250
    }
  ],
  "summary": {
    "total_requests": 1523,
    "hourly_usage": 45,
    "daily_usage": 320,
    "hourly_limit": 1000,
    "daily_limit": 10000
  }
}
```

## Data Access Endpoints (API Key Protected)

These endpoints should accept API key authentication via `Authorization: Bearer <api_key>` header.

### Middleware: API Key Validation

Before processing data requests, validate the API key:

1. Extract key from Authorization header
2. Hash the key and look up in database
3. Check if key is active and not expired
4. Check rate limits (hourly and daily)
5. Log the request to `api_key_usage` table
6. Update `last_used_at` and increment `total_requests`

### Rate Limiting Logic

For each request:
1. Get current hour and day windows
2. Check/create entry in `rate_limit_tracking` table
3. Increment counters
4. If limits exceeded, return 429 Too Many Requests

**Rate Limit Error Response (429):**
```json
{
  "error": "Rate limit exceeded",
  "limit": "1000 requests per hour",
  "reset_at": "2024-01-20T15:00:00Z",
  "retry_after": 1800
}
```

## Database Schema

Create these tables in your MySQL database:

```sql
-- User roles enum
CREATE TABLE user_roles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    role ENUM('admin', 'collaborator', 'user') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_role (user_id, role),
    INDEX idx_user_id (user_id)
);

-- User profiles
CREATE TABLE profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    organization VARCHAR(255),
    research_focus TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

-- API keys
CREATE TABLE api_keys (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    key_prefix VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    allowed_databases JSON DEFAULT '["seasonal_qaqc_data"]',
    rate_limit_per_hour INT DEFAULT 1000,
    rate_limit_per_day INT DEFAULT 10000,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP NULL,
    total_requests BIGINT DEFAULT 0,
    INDEX idx_user_id (user_id),
    INDEX idx_key_hash (key_hash),
    INDEX idx_active (is_active)
);

-- API key usage tracking
CREATE TABLE api_key_usage (
    id VARCHAR(36) PRIMARY KEY,
    api_key_id VARCHAR(36) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INT,
    response_time_ms INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    database_accessed VARCHAR(100),
    table_accessed VARCHAR(100),
    records_returned INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_api_key_id (api_key_id),
    INDEX idx_created_at (created_at)
);

-- Rate limit tracking
CREATE TABLE rate_limit_tracking (
    id VARCHAR(36) PRIMARY KEY,
    api_key_id VARCHAR(36) NOT NULL,
    hour_window TIMESTAMP NOT NULL,
    day_window DATE NOT NULL,
    hourly_count INT DEFAULT 0,
    daily_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_api_key_hour (api_key_id, hour_window),
    UNIQUE KEY unique_api_key_day (api_key_id, day_window),
    INDEX idx_api_key_id (api_key_id)
);
```

## Security Recommendations

1. **Password Hashing:** Use bcrypt with at least 10 rounds
2. **JWT Tokens:** Use secure secret key, set expiration (e.g., 24 hours)
3. **API Key Generation:** Use cryptographically secure random strings (40+ characters)
4. **API Key Storage:** Store only hashed versions (bcrypt)
5. **HTTPS Only:** Enforce HTTPS in production
6. **CORS:** Configure appropriate CORS headers
7. **Input Validation:** Validate all input parameters
8. **SQL Injection:** Use parameterized queries
9. **Rate Limiting:** Implement per-IP rate limiting in addition to per-key limits
10. **Logging:** Log all authentication attempts and API key usage

## Implementation Example (Node.js/Express)

```javascript
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// API Key validation middleware
async function validateAPIKey(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing API key' });
  }

  const apiKey = authHeader.substring(7);
  const keyHash = await bcrypt.hash(apiKey, 10);

  // Look up key in database
  const key = await db.query(
    'SELECT * FROM api_keys WHERE key_hash = ? AND is_active = TRUE',
    [keyHash]
  );

  if (!key) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  // Check rate limits
  const now = new Date();
  const hourWindow = new Date(now.setMinutes(0, 0, 0));
  const dayWindow = now.toISOString().split('T')[0];

  const limits = await db.query(
    'SELECT * FROM rate_limit_tracking WHERE api_key_id = ? AND (hour_window = ? OR day_window = ?)',
    [key.id, hourWindow, dayWindow]
  );

  // Check if limits exceeded
  // ... implement rate limit logic

  // Log usage
  await db.query(
    'INSERT INTO api_key_usage (api_key_id, endpoint, method, ...) VALUES (...)',
    [/* usage data */]
  );

  req.apiKey = key;
  next();
}

// Generate new API key
function generateAPIKey() {
  return 's2s_' + crypto.randomBytes(32).toString('hex');
}
```
