// Authentication Routes for Summit2Shore API
const express = require('express');
const router = express.Router();
const { 
  verifyToken, 
  generateToken, 
  hashPassword, 
  comparePassword,
  authConfig 
} = require('../middleware/auth.middleware');

/**
 * Initialize auth routes with database pool
 */
module.exports = (pool) => {
  
  /**
   * POST /auth/signup
   * Create a new user account
   */
  router.post('/signup', async (req, res) => {
    try {
      const { email, password, full_name, organization } = req.body;

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
          'SELECT id FROM users WHERE email = ?',
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

        // Create user
        const [result] = await connection.execute(
          `INSERT INTO users (email, password_hash, full_name, organization, is_active, created_at)
           VALUES (?, ?, ?, ?, TRUE, NOW())`,
          [email.toLowerCase(), passwordHash, full_name || null, organization || null]
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

        res.status(201).json({
          success: true,
          message: 'Account created successfully. Please log in.',
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
        // Find user
        const [users] = await connection.execute(
          'SELECT id, email, password_hash, full_name, organization, is_active FROM users WHERE email = ?',
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

        // Verify password
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
