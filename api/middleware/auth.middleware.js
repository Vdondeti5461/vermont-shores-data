// Authentication Middleware for Summit2Shore API
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authConfig = require('../config/auth.config');

/**
 * Verify JWT Token Middleware
 * Extracts and verifies JWT from Authorization header
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'No authorization header provided'
      });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        error: 'INVALID_TOKEN_FORMAT',
        message: 'Authorization header must be: Bearer <token>'
      });
    }

    const token = parts[1];
    
    const decoded = jwt.verify(token, authConfig.jwt.secret, {
      issuer: authConfig.jwt.issuer,
      audience: authConfig.jwt.audience
    });

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'TOKEN_EXPIRED',
        message: 'Token has expired. Please login again.'
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: 'Invalid token'
      });
    }
    return res.status(500).json({
      success: false,
      error: 'AUTH_ERROR',
      message: 'Authentication error'
    });
  }
};

/**
 * Verify API Key Middleware
 * Checks X-API-Key header for valid API key
 */
const verifyApiKey = (pool) => async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      // No API key - continue as public access
      req.apiKeyAuth = null;
      req.accessLevel = 'public';
      return next();
    }

    // Check API key prefix
    if (!apiKey.startsWith(authConfig.apiKey.prefix)) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_API_KEY',
        message: 'Invalid API key format. Keys must start with s2s_'
      });
    }

    // Look up API key in database
    const connection = await pool.getConnection();
    
    try {
      const [keys] = await connection.execute(
        `SELECT ak.*, u.email, u.is_active as user_active
         FROM api_keys ak
         JOIN users u ON ak.user_id = u.id
         WHERE ak.key_prefix = ? AND ak.is_active = TRUE`,
        [apiKey.substring(0, 12)]
      );

      if (keys.length === 0) {
        connection.release();
        return res.status(401).json({
          success: false,
          error: 'API_KEY_NOT_FOUND',
          message: 'API key not found or has been revoked'
        });
      }

      const keyRecord = keys[0];

      // Verify full key hash
      const isValid = await bcrypt.compare(apiKey, keyRecord.key_hash);
      if (!isValid) {
        connection.release();
        return res.status(401).json({
          success: false,
          error: 'INVALID_API_KEY',
          message: 'Invalid API key'
        });
      }

      // Check if key is expired
      if (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date()) {
        connection.release();
        return res.status(401).json({
          success: false,
          error: 'API_KEY_EXPIRED',
          message: 'API key has expired'
        });
      }

      // Check if user is active
      if (!keyRecord.user_active) {
        connection.release();
        return res.status(403).json({
          success: false,
          error: 'USER_INACTIVE',
          message: 'User account is inactive'
        });
      }

      // Update last used timestamp
      await connection.execute(
        'UPDATE api_keys SET last_used_at = NOW() WHERE id = ?',
        [keyRecord.id]
      );

      connection.release();

      req.apiKeyAuth = {
        keyId: keyRecord.id,
        userId: keyRecord.user_id,
        email: keyRecord.email,
        name: keyRecord.name,
        permissions: JSON.parse(keyRecord.permissions || '{}'),
        rateLimitPerHour: keyRecord.rate_limit_per_hour,
        rateLimitPerDay: keyRecord.rate_limit_per_day
      };
      req.accessLevel = 'authenticated';
      next();
    } catch (error) {
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('API Key verification error:', error);
    return res.status(500).json({
      success: false,
      error: 'AUTH_ERROR',
      message: 'Authentication error'
    });
  }
};

/**
 * Optional Token Verification
 * Sets user info if token present, but doesn't require it
 */
const optionalToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    req.user = null;
    return next();
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(parts[1], authConfig.jwt.secret, {
      issuer: authConfig.jwt.issuer,
      audience: authConfig.jwt.audience
    });
    req.user = decoded;
  } catch (error) {
    req.user = null;
  }
  next();
};

/**
 * Generate JWT Token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      fullName: user.full_name
    },
    authConfig.jwt.secret,
    {
      expiresIn: authConfig.jwt.expiresIn,
      issuer: authConfig.jwt.issuer,
      audience: authConfig.jwt.audience
    }
  );
};

/**
 * Generate API Key
 */
const generateApiKey = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = authConfig.apiKey.prefix;
  for (let i = 0; i < authConfig.apiKey.length; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
};

/**
 * Hash API Key
 */
const hashApiKey = async (apiKey) => {
  return bcrypt.hash(apiKey, authConfig.bcrypt.saltRounds);
};

/**
 * Hash Password
 */
const hashPassword = async (password) => {
  return bcrypt.hash(password, authConfig.bcrypt.saltRounds);
};

/**
 * Compare Password
 */
const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

module.exports = {
  verifyToken,
  verifyApiKey,
  optionalToken,
  generateToken,
  generateApiKey,
  hashApiKey,
  hashPassword,
  comparePassword,
  authConfig
};
