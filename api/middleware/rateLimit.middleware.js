// Rate Limiting Middleware for Summit2Shore API
const authConfig = require('../config/auth.config');

/**
 * Rate Limiter using MySQL for distributed rate limiting
 */
const createRateLimiter = (pool) => {
  return async (req, res, next) => {
    try {
      const now = new Date();
      const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
      
      // Determine identifier and limits based on auth type
      let identifier;
      let hourlyLimit;
      let windowType;

      if (req.apiKeyAuth) {
        // Authenticated with API key
        identifier = `apikey:${req.apiKeyAuth.keyId}`;
        hourlyLimit = req.apiKeyAuth.rateLimitPerHour || authConfig.rateLimit.authenticated.requestsPerHour;
        windowType = 'api_key';
      } else {
        // Public access - rate limit by IP
        identifier = `ip:${req.ip || req.connection.remoteAddress}`;
        hourlyLimit = authConfig.rateLimit.public.requestsPerHour;
        windowType = 'ip';
      }

      const connection = await pool.getConnection();
      
      try {
        // Get or create rate limit record
        const [existing] = await connection.execute(
          `SELECT request_count FROM rate_limit_tracking 
           WHERE identifier = ? AND window_start = ? AND window_type = ?`,
          [identifier, hourStart, windowType]
        );

        let currentCount = 0;
        
        if (existing.length > 0) {
          currentCount = existing[0].request_count;
        }

        // Check if limit exceeded
        if (currentCount >= hourlyLimit) {
          connection.release();
          
          const retryAfter = Math.ceil((hourStart.getTime() + 3600000 - now.getTime()) / 1000);
          
          res.setHeader('X-RateLimit-Limit', hourlyLimit);
          res.setHeader('X-RateLimit-Remaining', 0);
          res.setHeader('X-RateLimit-Reset', Math.floor((hourStart.getTime() + 3600000) / 1000));
          res.setHeader('Retry-After', retryAfter);
          
          return res.status(429).json({
            success: false,
            error: 'RATE_LIMIT_EXCEEDED',
            message: `Rate limit exceeded. Try again in ${Math.ceil(retryAfter / 60)} minutes.`,
            limit: hourlyLimit,
            remaining: 0,
            resetAt: new Date(hourStart.getTime() + 3600000).toISOString()
          });
        }

        // Increment counter
        if (existing.length > 0) {
          await connection.execute(
            `UPDATE rate_limit_tracking SET request_count = request_count + 1 
             WHERE identifier = ? AND window_start = ? AND window_type = ?`,
            [identifier, hourStart, windowType]
          );
        } else {
          await connection.execute(
            `INSERT INTO rate_limit_tracking (identifier, window_start, window_type, request_count) 
             VALUES (?, ?, ?, 1)`,
            [identifier, hourStart, windowType]
          );
        }

        connection.release();

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', hourlyLimit);
        res.setHeader('X-RateLimit-Remaining', hourlyLimit - currentCount - 1);
        res.setHeader('X-RateLimit-Reset', Math.floor((hourStart.getTime() + 3600000) / 1000));

        next();
      } catch (error) {
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error('Rate limit error:', error);
      // On error, allow request but log the issue
      next();
    }
  };
};

/**
 * Log API usage for analytics
 */
const logApiUsage = (pool) => async (req, res, next) => {
  const startTime = Date.now();

  // Capture response when it finishes
  res.on('finish', async () => {
    try {
      if (req.apiKeyAuth) {
        const responseTime = Date.now() - startTime;
        const connection = await pool.getConnection();
        
        await connection.execute(
          `INSERT INTO api_key_usage (api_key_id, endpoint, method, status_code, response_time_ms)
           VALUES (?, ?, ?, ?, ?)`,
          [req.apiKeyAuth.keyId, req.originalUrl, req.method, res.statusCode, responseTime]
        );

        // Increment total requests on api_keys
        await connection.execute(
          `UPDATE api_keys SET total_requests = total_requests + 1 WHERE id = ?`,
          [req.apiKeyAuth.keyId]
        );

        connection.release();
      }
    } catch (error) {
      console.error('API usage logging error:', error);
    }
  });

  next();
};

/**
 * Clean up old rate limit records
 */
const cleanupRateLimits = async (pool) => {
  try {
    const connection = await pool.getConnection();
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    
    await connection.execute(
      'DELETE FROM rate_limit_tracking WHERE window_start < ?',
      [twoHoursAgo]
    );
    
    connection.release();
    console.log('Rate limit cleanup completed');
  } catch (error) {
    console.error('Rate limit cleanup error:', error);
  }
};

module.exports = {
  createRateLimiter,
  logApiUsage,
  cleanupRateLimits
};
