// API Key Management Routes for Summit2Shore API
const express = require('express');
const router = express.Router();
const { 
  verifyToken, 
  generateApiKey, 
  hashApiKey,
  authConfig 
} = require('../middleware/auth.middleware');

/**
 * Initialize API key routes with database pool
 */
module.exports = (pool) => {
  
  // All routes require JWT authentication
  router.use(verifyToken);

  /**
   * GET /api-keys
   * List all API keys for the authenticated user
   */
  router.get('/', async (req, res) => {
    try {
      const connection = await pool.getConnection();

      try {
        const [keys] = await connection.execute(
          `SELECT id, name, description, key_prefix, is_active, 
                  rate_limit_per_hour, rate_limit_per_day, total_requests,
                  created_at, last_used_at, expires_at
           FROM api_keys 
           WHERE user_id = ?
           ORDER BY created_at DESC`,
          [req.user.userId]
        );

        connection.release();

        res.json({
          success: true,
          keys: keys.map(k => ({
            id: k.id,
            name: k.name,
            description: k.description,
            key_prefix: k.key_prefix,
            is_active: k.is_active === 1,
            rate_limit_per_hour: k.rate_limit_per_hour,
            rate_limit_per_day: k.rate_limit_per_day,
            total_requests: k.total_requests,
            created_at: k.created_at,
            last_used_at: k.last_used_at,
            expires_at: k.expires_at
          }))
        });
      } catch (error) {
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error('List API keys error:', error);
      res.status(500).json({
        success: false,
        error: 'API_KEYS_ERROR',
        message: 'Failed to fetch API keys'
      });
    }
  });

  /**
   * POST /api-keys
   * Create a new API key
   */
  router.post('/', async (req, res) => {
    try {
      const { name, description, rate_limit_per_hour, expires_in_days } = req.body;

      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'API key name is required'
        });
      }

      const connection = await pool.getConnection();

      try {
        // Check existing key count (limit to 10 keys per user)
        const [existingCount] = await connection.execute(
          'SELECT COUNT(*) as count FROM api_keys WHERE user_id = ?',
          [req.user.userId]
        );

        if (existingCount[0].count >= 10) {
          connection.release();
          return res.status(400).json({
            success: false,
            error: 'KEY_LIMIT_REACHED',
            message: 'Maximum of 10 API keys per user. Please delete unused keys.'
          });
        }

        // Generate new API key
        const apiKey = generateApiKey();
        const keyHash = await hashApiKey(apiKey);
        const keyPrefix = apiKey.substring(0, 12);

        // Calculate expiration if specified
        let expiresAt = null;
        if (expires_in_days && expires_in_days > 0) {
          expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + expires_in_days);
        }

        // Default permissions - all databases for authenticated users
        const permissions = JSON.stringify({
          databases: ['seasonal_qaqc_data', 'raw_data', 'stage_clean_data', 'stage_qaqc_data'],
          operations: ['read']
        });

        // Insert API key
        const [result] = await connection.execute(
          `INSERT INTO api_keys (user_id, key_hash, key_prefix, name, description, permissions,
                                 rate_limit_per_hour, rate_limit_per_day, is_active, created_at, expires_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, NOW(), ?)`,
          [
            req.user.userId,
            keyHash,
            keyPrefix,
            name.trim(),
            description || null,
            permissions,
            rate_limit_per_hour || authConfig.apiKey.defaultRateLimitPerHour,
            authConfig.apiKey.defaultRateLimitPerDay,
            expiresAt
          ]
        );

        // Log key creation
        await connection.execute(
          `INSERT INTO audit_log (user_id, action, details, ip_address, created_at)
           VALUES (?, 'API_KEY_CREATED', ?, ?, NOW())`,
          [req.user.userId, JSON.stringify({ key_id: result.insertId, name }), req.ip]
        );

        connection.release();

        res.status(201).json({
          success: true,
          message: 'API key created successfully. Save this key - you won\'t see it again!',
          api_key: apiKey,
          key_id: result.insertId,
          key_prefix: keyPrefix,
          expires_at: expiresAt
        });
      } catch (error) {
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error('Create API key error:', error);
      res.status(500).json({
        success: false,
        error: 'CREATE_KEY_ERROR',
        message: 'Failed to create API key'
      });
    }
  });

  /**
   * GET /api-keys/:keyId
   * Get details for a specific API key
   */
  router.get('/:keyId', async (req, res) => {
    try {
      const { keyId } = req.params;
      const connection = await pool.getConnection();

      try {
        const [keys] = await connection.execute(
          `SELECT id, name, description, key_prefix, is_active, permissions,
                  rate_limit_per_hour, rate_limit_per_day, total_requests,
                  created_at, last_used_at, expires_at
           FROM api_keys 
           WHERE id = ? AND user_id = ?`,
          [keyId, req.user.userId]
        );

        if (keys.length === 0) {
          connection.release();
          return res.status(404).json({
            success: false,
            error: 'KEY_NOT_FOUND',
            message: 'API key not found'
          });
        }

        connection.release();

        const key = keys[0];
        res.json({
          success: true,
          key: {
            id: key.id,
            name: key.name,
            description: key.description,
            key_prefix: key.key_prefix,
            is_active: key.is_active === 1,
            permissions: JSON.parse(key.permissions || '{}'),
            rate_limit_per_hour: key.rate_limit_per_hour,
            rate_limit_per_day: key.rate_limit_per_day,
            total_requests: key.total_requests,
            created_at: key.created_at,
            last_used_at: key.last_used_at,
            expires_at: key.expires_at
          }
        });
      } catch (error) {
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error('Get API key error:', error);
      res.status(500).json({
        success: false,
        error: 'GET_KEY_ERROR',
        message: 'Failed to fetch API key'
      });
    }
  });

  /**
   * PUT /api-keys/:keyId
   * Update an API key
   */
  router.put('/:keyId', async (req, res) => {
    try {
      const { keyId } = req.params;
      const { name, description, is_active, rate_limit_per_hour } = req.body;

      const connection = await pool.getConnection();

      try {
        // Verify ownership
        const [existing] = await connection.execute(
          'SELECT id FROM api_keys WHERE id = ? AND user_id = ?',
          [keyId, req.user.userId]
        );

        if (existing.length === 0) {
          connection.release();
          return res.status(404).json({
            success: false,
            error: 'KEY_NOT_FOUND',
            message: 'API key not found'
          });
        }

        // Build update query dynamically
        const updates = [];
        const values = [];

        if (name !== undefined) {
          updates.push('name = ?');
          values.push(name.trim());
        }
        if (description !== undefined) {
          updates.push('description = ?');
          values.push(description);
        }
        if (is_active !== undefined) {
          updates.push('is_active = ?');
          values.push(is_active ? 1 : 0);
        }
        if (rate_limit_per_hour !== undefined) {
          updates.push('rate_limit_per_hour = ?');
          values.push(rate_limit_per_hour);
        }

        if (updates.length === 0) {
          connection.release();
          return res.status(400).json({
            success: false,
            error: 'NO_UPDATES',
            message: 'No updates provided'
          });
        }

        updates.push('updated_at = NOW()');
        values.push(keyId);

        await connection.execute(
          `UPDATE api_keys SET ${updates.join(', ')} WHERE id = ?`,
          values
        );

        await connection.execute(
          `INSERT INTO audit_log (user_id, action, details, ip_address, created_at)
           VALUES (?, 'API_KEY_UPDATED', ?, ?, NOW())`,
          [req.user.userId, JSON.stringify({ key_id: keyId }), req.ip]
        );

        connection.release();

        res.json({
          success: true,
          message: 'API key updated successfully'
        });
      } catch (error) {
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error('Update API key error:', error);
      res.status(500).json({
        success: false,
        error: 'UPDATE_KEY_ERROR',
        message: 'Failed to update API key'
      });
    }
  });

  /**
   * DELETE /api-keys/:keyId
   * Revoke/delete an API key
   */
  router.delete('/:keyId', async (req, res) => {
    try {
      const { keyId } = req.params;
      const connection = await pool.getConnection();

      try {
        // Verify ownership
        const [existing] = await connection.execute(
          'SELECT id, name FROM api_keys WHERE id = ? AND user_id = ?',
          [keyId, req.user.userId]
        );

        if (existing.length === 0) {
          connection.release();
          return res.status(404).json({
            success: false,
            error: 'KEY_NOT_FOUND',
            message: 'API key not found'
          });
        }

        // Soft delete - just deactivate
        await connection.execute(
          'UPDATE api_keys SET is_active = FALSE, updated_at = NOW() WHERE id = ?',
          [keyId]
        );

        await connection.execute(
          `INSERT INTO audit_log (user_id, action, details, ip_address, created_at)
           VALUES (?, 'API_KEY_REVOKED', ?, ?, NOW())`,
          [req.user.userId, JSON.stringify({ key_id: keyId, name: existing[0].name }), req.ip]
        );

        connection.release();

        res.json({
          success: true,
          message: 'API key revoked successfully'
        });
      } catch (error) {
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error('Delete API key error:', error);
      res.status(500).json({
        success: false,
        error: 'DELETE_KEY_ERROR',
        message: 'Failed to revoke API key'
      });
    }
  });

  /**
   * GET /api-keys/:keyId/usage
   * Get usage statistics for an API key
   */
  router.get('/:keyId/usage', async (req, res) => {
    try {
      const { keyId } = req.params;
      const { days = 7 } = req.query;

      const connection = await pool.getConnection();

      try {
        // Verify ownership
        const [existing] = await connection.execute(
          'SELECT id, name, total_requests FROM api_keys WHERE id = ? AND user_id = ?',
          [keyId, req.user.userId]
        );

        if (existing.length === 0) {
          connection.release();
          return res.status(404).json({
            success: false,
            error: 'KEY_NOT_FOUND',
            message: 'API key not found'
          });
        }

        // Get usage by endpoint
        const [byEndpoint] = await connection.execute(
          `SELECT endpoint, COUNT(*) as count, AVG(response_time_ms) as avg_response_time
           FROM api_key_usage 
           WHERE api_key_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
           GROUP BY endpoint
           ORDER BY count DESC
           LIMIT 10`,
          [keyId, parseInt(days)]
        );

        // Get usage by day
        const [byDay] = await connection.execute(
          `SELECT DATE(created_at) as date, COUNT(*) as count
           FROM api_key_usage 
           WHERE api_key_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
           GROUP BY DATE(created_at)
           ORDER BY date`,
          [keyId, parseInt(days)]
        );

        // Get status code distribution
        const [byStatus] = await connection.execute(
          `SELECT status_code, COUNT(*) as count
           FROM api_key_usage 
           WHERE api_key_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
           GROUP BY status_code
           ORDER BY count DESC`,
          [keyId, parseInt(days)]
        );

        connection.release();

        res.json({
          success: true,
          key_name: existing[0].name,
          total_requests: existing[0].total_requests,
          period_days: parseInt(days),
          usage: {
            by_endpoint: byEndpoint,
            by_day: byDay,
            by_status: byStatus
          }
        });
      } catch (error) {
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error('Get API key usage error:', error);
      res.status(500).json({
        success: false,
        error: 'USAGE_ERROR',
        message: 'Failed to fetch usage statistics'
      });
    }
  });

  return router;
};
