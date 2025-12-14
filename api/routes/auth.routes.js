// Authentication Routes for Summit2Shore API
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { 
  verifyToken, 
  generateToken, 
  hashPassword, 
  comparePassword,
  authConfig 
} = require('../middleware/auth.middleware');

// Generate a secure random token
function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Supabase edge function URL for sending emails
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ixxcjdlhhzhgssgvsjmr.supabase.co';

/**
 * Initialize auth routes with database pool
 */
module.exports = (pool) => {
  
  /**
   * POST /auth/signup
   * Create a new user account with email verification
   */
  router.post('/signup', async (req, res) => {
    try {
      const { email, password, full_name, organization, baseUrl } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Email and password are required'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_EMAIL',
          message: 'Please provide a valid email address'
        });
      }

      // Validate password length
      if (password.length < authConfig.password.minLength) {
        return res.status(400).json({
          success: false,
          error: 'WEAK_PASSWORD',
          message: `Password must be at least ${authConfig.password.minLength} characters long`
        });
      }

      const connection = await pool.getConnection();
      
      // Switch to auth database
      await connection.query('USE CRRELS2S_auth');

      try {
        // Check if user already exists
        const [existing] = await connection.execute(
          'SELECT id, email_verified FROM users WHERE email = ?',
          [email.toLowerCase()]
        );

        if (existing.length > 0) {
          connection.release();
          return res.status(409).json({
            success: false,
            error: 'EMAIL_EXISTS',
            message: 'An account with this email already exists'
          });
        }

        // Hash password
        const passwordHash = await hashPassword(password);
        
        // Generate verification token
        const verificationToken = generateSecureToken();
        const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Create user with verification token
        const [result] = await connection.execute(
          `INSERT INTO users (email, password_hash, full_name, organization, is_active, email_verified, verification_token, verification_token_expires, created_at)
           VALUES (?, ?, ?, ?, TRUE, FALSE, ?, ?, NOW())`,
          [email.toLowerCase(), passwordHash, full_name || null, organization || null, verificationToken, tokenExpires]
        );

        const userId = result.insertId;

        // Assign default 'user' role
        await connection.execute(
          `INSERT INTO user_roles (user_id, role) VALUES (?, 'user')`,
          [userId]
        );

        // Log signup event
        await connection.execute(
          `INSERT INTO audit_log (user_id, action, details, ip_address, created_at)
           VALUES (?, 'SIGNUP', ?, ?, NOW())`,
          [userId, JSON.stringify({ email: email.toLowerCase() }), req.ip]
        );

        connection.release();

        // Send verification email via edge function
        try {
          const emailBaseUrl = baseUrl || 'https://crrels2s.w3.uvm.edu';
          await fetch(`${SUPABASE_URL}/functions/v1/send-auth-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'verification',
              email: email.toLowerCase(),
              token: verificationToken,
              userName: full_name,
              baseUrl: emailBaseUrl
            })
          });
        } catch (emailError) {
          console.error('Failed to send verification email:', emailError);
        }

        res.status(201).json({
          success: true,
          message: 'Account created! Please check your email to verify your account.',
          requiresVerification: true,
          user: {
            id: userId,
            email: email.toLowerCase(),
            full_name: full_name || null
          }
        });
      } catch (error) {
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        success: false,
        error: 'SIGNUP_ERROR',
        message: 'Failed to create account'
      });
    }
  });

  /**
   * GET /auth/verify-email
   * Verify user's email with token
   */
  router.get('/verify-email', async (req, res) => {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_TOKEN',
          message: 'Verification token is required'
        });
      }

      const connection = await pool.getConnection();
      await connection.query('USE CRRELS2S_auth');

      try {
        // Find user with this token
        const [users] = await connection.execute(
          'SELECT id, email, verification_token_expires FROM users WHERE verification_token = ?',
          [token]
        );

        if (users.length === 0) {
          connection.release();
          return res.status(400).json({
            success: false,
            error: 'INVALID_TOKEN',
            message: 'Invalid or expired verification link'
          });
        }

        const user = users[0];

        // Check if token is expired
        if (new Date(user.verification_token_expires) < new Date()) {
          connection.release();
          return res.status(400).json({
            success: false,
            error: 'TOKEN_EXPIRED',
            message: 'Verification link has expired. Please request a new one.'
          });
        }

        // Mark email as verified
        await connection.execute(
          'UPDATE users SET email_verified = TRUE, verification_token = NULL, verification_token_expires = NULL WHERE id = ?',
          [user.id]
        );

        // Log verification
        await connection.execute(
          `INSERT INTO audit_log (user_id, action, details, ip_address, created_at)
           VALUES (?, 'EMAIL_VERIFIED', ?, ?, NOW())`,
          [user.id, JSON.stringify({ email: user.email }), req.ip]
        );

        connection.release();

        res.json({
          success: true,
          message: 'Email verified successfully! You can now log in.'
        });
      } catch (error) {
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({
        success: false,
        error: 'VERIFICATION_ERROR',
        message: 'Failed to verify email'
      });
    }
  });

  /**
   * POST /auth/resend-verification
   * Resend verification email
   */
  router.post('/resend-verification', async (req, res) => {
    try {
      const { email, baseUrl } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Email is required'
        });
      }

      const connection = await pool.getConnection();
      await connection.query('USE CRRELS2S_auth');

      try {
        const [users] = await connection.execute(
          'SELECT id, full_name, email_verified FROM users WHERE email = ?',
          [email.toLowerCase()]
        );

        if (users.length === 0) {
          connection.release();
          return res.status(404).json({
            success: false,
            error: 'USER_NOT_FOUND',
            message: 'No account found with this email'
          });
        }

        const user = users[0];

        if (user.email_verified) {
          connection.release();
          return res.status(400).json({
            success: false,
            error: 'ALREADY_VERIFIED',
            message: 'Email is already verified'
          });
        }

        // Generate new verification token
        const verificationToken = generateSecureToken();
        const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await connection.execute(
          'UPDATE users SET verification_token = ?, verification_token_expires = ? WHERE id = ?',
          [verificationToken, tokenExpires, user.id]
        );

        connection.release();

        // Send verification email
        try {
          const emailBaseUrl = baseUrl || 'https://crrels2s.w3.uvm.edu';
          await fetch(`${SUPABASE_URL}/functions/v1/send-auth-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'verification',
              email: email.toLowerCase(),
              token: verificationToken,
              userName: user.full_name,
              baseUrl: emailBaseUrl
            })
          });
        } catch (emailError) {
          console.error('Failed to send verification email:', emailError);
        }

        res.json({
          success: true,
          message: 'Verification email sent! Please check your inbox.'
        });
      } catch (error) {
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({
        success: false,
        error: 'RESEND_ERROR',
        message: 'Failed to resend verification email'
      });
    }
  });

  /**
   * POST /auth/forgot-password
   * Request password reset email
   */
  router.post('/forgot-password', async (req, res) => {
    try {
      const { email, baseUrl } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Email is required'
        });
      }

      const connection = await pool.getConnection();
      await connection.query('USE CRRELS2S_auth');

      try {
        const [users] = await connection.execute(
          'SELECT id, full_name, is_active FROM users WHERE email = ?',
          [email.toLowerCase()]
        );

        // Always return success to prevent email enumeration
        if (users.length === 0 || !users[0].is_active) {
          connection.release();
          return res.json({
            success: true,
            message: 'If an account exists with this email, you will receive a password reset link.'
          });
        }

        const user = users[0];

        // Generate reset token
        const resetToken = generateSecureToken();
        const tokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await connection.execute(
          'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
          [resetToken, tokenExpires, user.id]
        );

        // Log password reset request
        await connection.execute(
          `INSERT INTO audit_log (user_id, action, details, ip_address, created_at)
           VALUES (?, 'PASSWORD_RESET_REQUEST', ?, ?, NOW())`,
          [user.id, JSON.stringify({}), req.ip]
        );

        connection.release();

        // Send reset email
        try {
          const emailBaseUrl = baseUrl || 'https://crrels2s.w3.uvm.edu';
          await fetch(`${SUPABASE_URL}/functions/v1/send-auth-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'password_reset',
              email: email.toLowerCase(),
              token: resetToken,
              userName: user.full_name,
              baseUrl: emailBaseUrl
            })
          });
        } catch (emailError) {
          console.error('Failed to send reset email:', emailError);
        }

        res.json({
          success: true,
          message: 'If an account exists with this email, you will receive a password reset link.'
        });
      } catch (error) {
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        error: 'FORGOT_PASSWORD_ERROR',
        message: 'Failed to process password reset request'
      });
    }
  });

  /**
   * POST /auth/reset-password
   * Reset password with token
   */
  router.post('/reset-password', async (req, res) => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Token and new password are required'
        });
      }

      if (password.length < authConfig.password.minLength) {
        return res.status(400).json({
          success: false,
          error: 'WEAK_PASSWORD',
          message: `Password must be at least ${authConfig.password.minLength} characters long`
        });
      }

      const connection = await pool.getConnection();
      await connection.query('USE CRRELS2S_auth');

      try {
        const [users] = await connection.execute(
          'SELECT id, email, reset_token_expires FROM users WHERE reset_token = ?',
          [token]
        );

        if (users.length === 0) {
          connection.release();
          return res.status(400).json({
            success: false,
            error: 'INVALID_TOKEN',
            message: 'Invalid or expired reset link'
          });
        }

        const user = users[0];

        if (new Date(user.reset_token_expires) < new Date()) {
          connection.release();
          return res.status(400).json({
            success: false,
            error: 'TOKEN_EXPIRED',
            message: 'Reset link has expired. Please request a new one.'
          });
        }

        // Hash new password
        const passwordHash = await hashPassword(password);

        // Update password and clear reset token
        await connection.execute(
          'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
          [passwordHash, user.id]
        );

        // Log password reset
        await connection.execute(
          `INSERT INTO audit_log (user_id, action, details, ip_address, created_at)
           VALUES (?, 'PASSWORD_RESET_COMPLETE', ?, ?, NOW())`,
          [user.id, JSON.stringify({}), req.ip]
        );

        connection.release();

        res.json({
          success: true,
          message: 'Password reset successfully! You can now log in with your new password.'
        });
      } catch (error) {
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        error: 'RESET_PASSWORD_ERROR',
        message: 'Failed to reset password'
      });
    }
  });

  /**
   * POST /auth/login
   * Authenticate user and return JWT token
   */
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Email and password are required'
        });
      }

      const connection = await pool.getConnection();
      
      // Switch to auth database
      await connection.query('USE CRRELS2S_auth');

      try {
        // Find user including email_verified status
        const [users] = await connection.execute(
          'SELECT id, email, password_hash, full_name, organization, is_active, email_verified FROM users WHERE email = ?',
          [email.toLowerCase()]
        );

        if (users.length === 0) {
          connection.release();
          return res.status(401).json({
            success: false,
            error: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password'
          });
        }

        const user = users[0];

        // Check if user is active
        if (!user.is_active) {
          connection.release();
          return res.status(403).json({
            success: false,
            error: 'ACCOUNT_INACTIVE',
            message: 'Your account has been deactivated. Please contact support.'
          });
        }

        // Verify password first
        const isValidPassword = await comparePassword(password, user.password_hash);
        if (!isValidPassword) {
          // Log failed attempt
          await connection.execute(
            `INSERT INTO audit_log (user_id, action, details, ip_address, created_at)
             VALUES (?, 'LOGIN_FAILED', ?, ?, NOW())`,
            [user.id, JSON.stringify({ reason: 'Invalid password' }), req.ip]
          );
          connection.release();

          return res.status(401).json({
            success: false,
            error: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password'
          });
        }

        // Check if email is verified
        if (!user.email_verified) {
          connection.release();
          return res.status(403).json({
            success: false,
            error: 'EMAIL_NOT_VERIFIED',
            message: 'Please verify your email before logging in. Check your inbox for the verification link.',
            email: user.email
          });
        }

        // Generate token
        const token = generateToken(user);

        // Log successful login
        await connection.execute(
          `INSERT INTO audit_log (user_id, action, details, ip_address, created_at)
           VALUES (?, 'LOGIN_SUCCESS', ?, ?, NOW())`,
          [user.id, JSON.stringify({ ip: req.ip }), req.ip]
        );

        // Get user roles
        const [roles] = await connection.execute(
          'SELECT role FROM user_roles WHERE user_id = ?',
          [user.id]
        );

        connection.release();

        res.json({
          success: true,
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            organization: user.organization,
            email_verified: user.email_verified,
            roles: roles.map(r => r.role)
          }
        });
      } catch (error) {
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'LOGIN_ERROR',
        message: 'Login failed'
      });
    }
  });

  /**
   * GET /auth/verify
   * Verify JWT token and return user info
   */
  router.get('/verify', verifyToken, async (req, res) => {
    try {
      const connection = await pool.getConnection();
      await connection.query('USE CRRELS2S_auth');

      try {
        const [users] = await connection.execute(
          'SELECT id, email, full_name, organization, is_active, created_at FROM users WHERE id = ?',
          [req.user.userId]
        );

        if (users.length === 0) {
          connection.release();
          return res.status(404).json({
            success: false,
            error: 'USER_NOT_FOUND',
            message: 'User not found'
          });
        }

        const [roles] = await connection.execute(
          'SELECT role FROM user_roles WHERE user_id = ?',
          [req.user.userId]
        );

        connection.release();

        res.json({
          success: true,
          user: {
            ...users[0],
            roles: roles.map(r => r.role)
          }
        });
      } catch (error) {
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error('Verify error:', error);
      res.status(500).json({
        success: false,
        error: 'VERIFY_ERROR',
        message: 'Token verification failed'
      });
    }
  });

  /**
   * POST /auth/logout
   * Logout user (client should delete token)
   */
  router.post('/logout', verifyToken, async (req, res) => {
    try {
      const connection = await pool.getConnection();
      await connection.query('USE CRRELS2S_auth');
      
      await connection.execute(
        `INSERT INTO audit_log (user_id, action, details, ip_address, created_at)
         VALUES (?, 'LOGOUT', ?, ?, NOW())`,
        [req.user.userId, JSON.stringify({}), req.ip]
      );
      
      connection.release();

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'LOGOUT_ERROR',
        message: 'Logout failed'
      });
    }
  });

  /**
   * GET /auth/profile
   * Get current user's profile
   */
  router.get('/profile', verifyToken, async (req, res) => {
    try {
      const connection = await pool.getConnection();
      await connection.query('USE CRRELS2S_auth');

      try {
        const [users] = await connection.execute(
          `SELECT id, email, full_name, organization, is_active, created_at, updated_at 
           FROM users WHERE id = ?`,
          [req.user.userId]
        );

        if (users.length === 0) {
          connection.release();
          return res.status(404).json({
            success: false,
            error: 'USER_NOT_FOUND',
            message: 'User not found'
          });
        }

        const [roles] = await connection.execute(
          'SELECT role FROM user_roles WHERE user_id = ?',
          [req.user.userId]
        );

        const [apiKeyCount] = await connection.execute(
          'SELECT COUNT(*) as count FROM api_keys WHERE user_id = ? AND is_active = TRUE',
          [req.user.userId]
        );

        connection.release();

        res.json({
          success: true,
          profile: {
            ...users[0],
            roles: roles.map(r => r.role),
            active_api_keys: apiKeyCount[0].count
          }
        });
      } catch (error) {
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({
        success: false,
        error: 'PROFILE_ERROR',
        message: 'Failed to fetch profile'
      });
    }
  });

  /**
   * PUT /auth/profile
   * Update current user's profile
   */
  router.put('/profile', verifyToken, async (req, res) => {
    try {
      const { full_name, organization } = req.body;

      const connection = await pool.getConnection();
      await connection.query('USE CRRELS2S_auth');

      try {
        await connection.execute(
          `UPDATE users SET full_name = ?, organization = ?, updated_at = NOW() WHERE id = ?`,
          [full_name || null, organization || null, req.user.userId]
        );

        await connection.execute(
          `INSERT INTO audit_log (user_id, action, details, ip_address, created_at)
           VALUES (?, 'PROFILE_UPDATE', ?, ?, NOW())`,
          [req.user.userId, JSON.stringify({ full_name, organization }), req.ip]
        );

        connection.release();

        res.json({
          success: true,
          message: 'Profile updated successfully'
        });
      } catch (error) {
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({
        success: false,
        error: 'PROFILE_UPDATE_ERROR',
        message: 'Failed to update profile'
      });
    }
  });

  return router;
};
