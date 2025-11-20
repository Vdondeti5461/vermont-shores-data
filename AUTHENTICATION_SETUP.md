# Authentication Setup Guide for Summit2Shore Portal

## Overview
This guide explains how to set up user authentication for the Summit2Shore data portal using your own MySQL database at `crrels2s.w3.uvm.edu`.

## Database Schema Requirements

### 1. Users Table
Create a table to store user accounts:

```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    organization VARCHAR(255),
    research_focus TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. User Sessions Table (Optional but Recommended)
For managing active sessions:

```sql
CREATE TABLE user_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(512) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3. User Roles Table
For role-based access control:

```sql
CREATE TABLE user_roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    role ENUM('admin', 'researcher', 'user') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_role (user_id, role),
    INDEX idx_user_id (user_id),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Required API Endpoints

### 1. User Signup
**Endpoint:** `POST /auth/signup`

**Request Body:**
```json
{
  "email": "researcher@university.edu",
  "password": "secure_password",
  "full_name": "Dr. Jane Smith",
  "organization": "University of Vermont",
  "research_focus": "Climate change and environmental monitoring"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "uuid-here",
    "email": "researcher@university.edu",
    "full_name": "Dr. Jane Smith",
    "organization": "University of Vermont"
  }
}
```

**Response (Error - 400/409):**
```json
{
  "success": false,
  "message": "Email already exists"
}
```

**Implementation Notes:**
- Hash passwords using bcrypt (minimum 10 rounds)
- Validate email format
- Check for existing email before insertion
- Generate UUID for user ID
- Assign default 'user' role automatically
- Do NOT return password hash in response

### 2. User Login
**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "researcher@university.edu",
  "password": "secure_password"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "uuid-here",
    "email": "researcher@university.edu",
    "full_name": "Dr. Jane Smith",
    "organization": "University of Vermont",
    "roles": ["user"]
  }
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Implementation Notes:**
- Verify password using bcrypt.compare()
- Update last_login timestamp
- Generate JWT token with 24-hour expiration
- Include user ID and roles in JWT payload
- Return user data (excluding password)

### 3. Verify Token
**Endpoint:** `GET /auth/verify`

**Headers:**
```
Authorization: Bearer jwt-token-here
```

**Response (Success - 200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "email": "researcher@university.edu",
    "full_name": "Dr. Jane Smith",
    "roles": ["user"]
  }
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 4. Logout
**Endpoint:** `POST /auth/logout`

**Headers:**
```
Authorization: Bearer jwt-token-here
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Implementation Notes:**
- Invalidate the session token
- Remove from user_sessions table if using session tracking

### 5. Get User Profile
**Endpoint:** `GET /auth/profile`

**Headers:**
```
Authorization: Bearer jwt-token-here
```

**Response (Success - 200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "email": "researcher@university.edu",
    "full_name": "Dr. Jane Smith",
    "organization": "University of Vermont",
    "research_focus": "Climate change",
    "roles": ["user"],
    "created_at": "2024-01-15T10:00:00Z",
    "last_login": "2024-11-20T14:30:00Z"
  }
}
```

### 6. Update User Profile
**Endpoint:** `PUT /auth/profile`

**Headers:**
```
Authorization: Bearer jwt-token-here
```

**Request Body:**
```json
{
  "full_name": "Dr. Jane Smith-Johnson",
  "organization": "UVM",
  "research_focus": "Environmental data science"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "uuid-here",
    "email": "researcher@university.edu",
    "full_name": "Dr. Jane Smith-Johnson",
    "organization": "UVM",
    "research_focus": "Environmental data science"
  }
}
```

## Security Best Practices

### Password Security
- **Minimum Length:** 8 characters
- **Hashing:** Use bcrypt with salt rounds >= 10
- **Never store plain text passwords**
- **Never log passwords**

### JWT Token Security
- **Secret Key:** Use strong, random secret (minimum 256 bits)
- **Expiration:** Set reasonable expiration (24 hours recommended)
- **Payload:** Include only necessary data (user_id, roles)
- **Storage:** Frontend stores in localStorage
- **Transmission:** Always use HTTPS in production

### Example JWT Payload:
```json
{
  "user_id": "uuid-here",
  "email": "researcher@university.edu",
  "roles": ["user"],
  "iat": 1700000000,
  "exp": 1700086400
}
```

### Rate Limiting
Implement rate limiting on authentication endpoints:
- Login: 5 attempts per 15 minutes per IP
- Signup: 3 attempts per hour per IP
- Password reset: 3 attempts per hour per email

### CORS Configuration
Configure CORS to allow requests from your frontend domain:
```javascript
// Example Node.js/Express
app.use(cors({
  origin: ['https://crrels2s.w3.uvm.edu', 'http://localhost:5173'],
  credentials: true
}));
```

## Implementation Checklist

- [ ] Create database tables (users, user_sessions, user_roles)
- [ ] Implement password hashing with bcrypt
- [ ] Set up JWT token generation and verification
- [ ] Create signup endpoint with validation
- [ ] Create login endpoint with authentication
- [ ] Create token verification endpoint
- [ ] Create logout endpoint
- [ ] Create profile endpoints (get/update)
- [ ] Implement rate limiting
- [ ] Configure CORS properly
- [ ] Set up HTTPS for production
- [ ] Test all authentication flows
- [ ] Add logging for security events

## Testing Authentication

### Test Signup:
```bash
curl -X POST https://crrels2s.w3.uvm.edu/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "full_name": "Test User",
    "organization": "Test Org"
  }'
```

### Test Login:
```bash
curl -X POST https://crrels2s.w3.uvm.edu/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

### Test Profile Access:
```bash
curl -X GET https://crrels2s.w3.uvm.edu/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Common Issues and Solutions

### Issue: "Invalid token"
- Check token expiration
- Verify JWT secret matches between generation and verification
- Ensure token is properly formatted in Authorization header

### Issue: "Email already exists"
- Check for duplicate email in database
- Implement proper uniqueness validation

### Issue: CORS errors
- Verify CORS configuration allows your frontend domain
- Check that credentials are enabled if needed

### Issue: Password validation fails
- Ensure bcrypt compare is being used correctly
- Verify password is being hashed before storage
- Check salt rounds configuration

## Frontend Integration

The frontend is already configured to work with these endpoints. It will:
1. Send credentials to `/auth/signup` or `/auth/login`
2. Store the returned JWT token in localStorage
3. Include token in Authorization header for protected routes
4. Redirect to login page if token is invalid/expired

## Next Steps

After implementing authentication:
1. Test all endpoints thoroughly
2. Implement API key management system (see BACKEND_API_ENDPOINTS.md)
3. Add protected data download endpoints
4. Implement usage tracking and rate limiting
5. Set up monitoring and logging
