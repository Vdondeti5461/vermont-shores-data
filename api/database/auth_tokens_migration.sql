-- =====================================================
-- Email Verification & Password Reset Tokens Migration
-- Run this on CRRELS2S_auth database
-- =====================================================

USE CRRELS2S_auth;

-- Add verification and reset token columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP NULL;

-- Create indexes for token lookups
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);

-- Note: email_verified column already exists in the schema
