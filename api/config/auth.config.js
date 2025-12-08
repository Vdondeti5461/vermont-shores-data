// Authentication Configuration for Summit2Shore API
// All sensitive values should be loaded from environment variables

module.exports = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-in-production-use-64-char-random-string',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    issuer: 'summit2shore-api',
    audience: 'summit2shore-users'
  },

  // Bcrypt Configuration
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12
  },

  // API Key Configuration
  apiKey: {
    prefix: 's2s_',
    length: 32,
    defaultRateLimitPerHour: 1000,
    defaultRateLimitPerDay: 10000
  },

  // Rate Limiting Configuration
  rateLimit: {
    public: {
      requestsPerHour: 100,
      requestsPerDay: 500
    },
    authenticated: {
      requestsPerHour: 1000,
      requestsPerDay: 10000
    },
    windowMs: 60 * 60 * 1000 // 1 hour
  },

  // Password Requirements
  password: {
    minLength: 8,
    maxLength: 128,
    requireNumbers: false,
    requireSpecialChars: false
  },

  // Session Configuration
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    maxSessions: 5 // Max active sessions per user
  }
};
