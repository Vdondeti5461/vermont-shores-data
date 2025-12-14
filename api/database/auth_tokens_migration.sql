-- =====================================================
-- Email Verification & Password Reset Tokens Migration
-- Run this on CRRELS2S_auth database
-- =====================================================

USE CRRELS2S_auth;

-- Add verification and reset token columns to users table
-- Note: Run these one at a time if columns already exist

ALTER TABLE users 
ADD COLUMN verification_token VARCHAR(255) NULL,
ADD COLUMN verification_token_expires TIMESTAMP NULL,
ADD COLUMN reset_token VARCHAR(255) NULL,
ADD COLUMN reset_token_expires TIMESTAMP NULL;

-- Create indexes for token lookups
CREATE INDEX idx_users_verification_token ON users(verification_token);
CREATE INDEX idx_users_reset_token ON users(reset_token);

-- Note: email_verified column already exists in the schema
