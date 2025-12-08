-- =====================================================
-- Summit2Shore API Authentication Database Schema
-- Run this script on your MySQL database to create
-- the required authentication tables
-- =====================================================

-- Use your authentication database (can be same as data or separate)
-- Uncomment and modify if using a separate database:
-- CREATE DATABASE IF NOT EXISTS CRRELS2S_auth;
-- USE CRRELS2S_auth;

-- =====================================================
-- 1. USERS TABLE
-- Stores user account information
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    organization VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_users_email (email),
    INDEX idx_users_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. USER ROLES TABLE
-- Stores user role assignments (user, admin, researcher)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_roles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    role ENUM('user', 'admin', 'researcher') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_user_role (user_id, role),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_roles_user (user_id),
    INDEX idx_user_roles_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. USER SESSIONS TABLE
-- Tracks active user sessions (optional for session management)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    user_agent VARCHAR(500),
    ip_address VARCHAR(45),
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sessions_user (user_id),
    INDEX idx_sessions_token (token_hash),
    INDEX idx_sessions_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. API KEYS TABLE
-- Stores hashed API keys for programmatic access
-- =====================================================
CREATE TABLE IF NOT EXISTS api_keys (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(12) NOT NULL,  -- First 12 chars for identification (s2s_XXXXXXXX)
    name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSON,  -- {"databases": ["seasonal_qaqc_data"], "operations": ["read"]}
    rate_limit_per_hour INT UNSIGNED DEFAULT 1000,
    rate_limit_per_day INT UNSIGNED DEFAULT 10000,
    total_requests BIGINT UNSIGNED DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_api_keys_user (user_id),
    INDEX idx_api_keys_prefix (key_prefix),
    INDEX idx_api_keys_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. API KEY USAGE TABLE
-- Tracks API key usage for analytics
-- =====================================================
CREATE TABLE IF NOT EXISTS api_key_usage (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    api_key_id INT UNSIGNED NOT NULL,
    endpoint VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code SMALLINT UNSIGNED,
    response_time_ms INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE,
    INDEX idx_usage_key (api_key_id),
    INDEX idx_usage_created (created_at),
    INDEX idx_usage_endpoint (endpoint(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. RATE LIMIT TRACKING TABLE
-- Tracks request counts for rate limiting
-- =====================================================
CREATE TABLE IF NOT EXISTS rate_limit_tracking (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    identifier VARCHAR(100) NOT NULL,  -- "ip:192.168.1.1" or "apikey:123"
    window_start TIMESTAMP NOT NULL,
    window_type ENUM('ip', 'api_key') NOT NULL,
    request_count INT UNSIGNED DEFAULT 1,
    
    UNIQUE KEY unique_rate_limit (identifier, window_start, window_type),
    INDEX idx_rate_limit_window (window_start)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. AUDIT LOG TABLE
-- Tracks important security events
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED,
    action VARCHAR(50) NOT NULL,
    details JSON,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 8. BULK DOWNLOAD REQUESTS TABLE
-- Tracks bulk data download requests
-- =====================================================
CREATE TABLE IF NOT EXISTS bulk_download_requests (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED,
    requester_email VARCHAR(255) NOT NULL,
    requester_name VARCHAR(255),
    organization VARCHAR(255),
    databases_requested JSON,
    date_range_start DATE,
    date_range_end DATE,
    locations JSON,
    purpose TEXT,
    status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
    admin_notes TEXT,
    processed_at TIMESTAMP NULL,
    processed_by INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_bulk_status (status),
    INDEX idx_bulk_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- CLEANUP EVENT - Remove old rate limit records
-- =====================================================
-- Enable event scheduler if not already enabled:
-- SET GLOBAL event_scheduler = ON;

DELIMITER //

CREATE EVENT IF NOT EXISTS cleanup_rate_limits
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
    DELETE FROM rate_limit_tracking 
    WHERE window_start < DATE_SUB(NOW(), INTERVAL 2 HOUR);
END //

CREATE EVENT IF NOT EXISTS cleanup_old_sessions
ON SCHEDULE EVERY 1 DAY
DO
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < NOW() OR is_revoked = TRUE;
END //

DELIMITER ;

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================
-- Uncomment to create a test admin user (password: 'admin123')
-- INSERT INTO users (email, password_hash, full_name, organization, is_active, email_verified)
-- VALUES ('admin@uvm.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyBAl.HqRq6ETC', 'Admin User', 'University of Vermont', TRUE, TRUE);
-- INSERT INTO user_roles (user_id, role) VALUES (1, 'admin');

-- =====================================================
-- GRANT PERMISSIONS (Run as database admin)
-- =====================================================
-- Replace 'crrels2s_admin' with your application user
-- GRANT SELECT, INSERT, UPDATE, DELETE ON users TO 'crrels2s_admin'@'%';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON user_roles TO 'crrels2s_admin'@'%';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON user_sessions TO 'crrels2s_admin'@'%';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON api_keys TO 'crrels2s_admin'@'%';
-- GRANT SELECT, INSERT, DELETE ON api_key_usage TO 'crrels2s_admin'@'%';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON rate_limit_tracking TO 'crrels2s_admin'@'%';
-- GRANT SELECT, INSERT ON audit_log TO 'crrels2s_admin'@'%';
-- GRANT SELECT, INSERT, UPDATE ON bulk_download_requests TO 'crrels2s_admin'@'%';
