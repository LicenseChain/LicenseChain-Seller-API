import dotenv from 'dotenv';

dotenv.config();

export const config = {
  app: {
    name: 'LicenseChain Seller API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3002'),
    host: process.env.HOST || '0.0.0.0',
    secret: process.env.APP_SECRET || 'your-secret-key',
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/licensechain_seller',
    ssl: process.env.NODE_ENV === 'production',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-jwt-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'https://licensechain.app'],
  },
  rateLimit: {
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '1000'),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  },
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    from: process.env.SMTP_FROM || 'noreply@licensechain.app',
  },
  licenseChain: {
    apiUrl: process.env.LICENSE_CHAIN_API_URL || 'https://api.licensechain.app',
    apiKey: process.env.LICENSE_CHAIN_API_KEY,
  },
  webhooks: {
    secret: process.env.WEBHOOK_SECRET || 'your-webhook-secret',
  },
  analytics: {
    enabled: process.env.ANALYTICS_ENABLED === 'true',
    trackingId: process.env.ANALYTICS_TRACKING_ID,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },
};
