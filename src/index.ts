/**
 * LicenseChain Seller API
 * Advanced seller management and analytics platform
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { requestLogger } from './middleware/requestLogger';

// Import routes
import authRoutes from './routes/auth';
import sellerRoutes from './routes/sellers';
import analyticsRoutes from './routes/analytics';
import webhookRoutes from './routes/webhooks';
import paymentRoutes from './routes/payments';
import licenseRoutes from './routes/licenses';
import userRoutes from './routes/users';
import adminRoutes from './routes/admin';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: config.cors.origins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.rateLimit.maxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: config.app.version,
    service: 'LicenseChain Seller API',
    uptime: process.uptime(),
  });
});

// API info
app.get('/', (req, res) => {
  res.json({
    name: 'LicenseChain Seller API',
    version: config.app.version,
    description: 'Advanced seller management and analytics platform',
    documentation: 'https://docs.licensechain.app/seller-api',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      sellers: '/api/sellers',
      analytics: '/api/analytics',
      webhooks: '/api/webhooks',
      payments: '/api/payments',
      licenses: '/api/licenses',
      users: '/api/users',
      admin: '/api/admin',
    },
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/sellers', authMiddleware, sellerRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/payments', authMiddleware, paymentRoutes);
app.use('/api/licenses', authMiddleware, licenseRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Error handling
app.use(errorHandler);

// Start server
const PORT = config.app.port || 3002;
const HOST = config.app.host || '0.0.0.0';

app.listen(PORT, HOST, () => {
  logger.info(`LicenseChain Seller API server running on http://${HOST}:${PORT}`);
  logger.info(`Environment: ${config.app.environment}`);
  logger.info(`Version: ${config.app.version}`);
});

export default app;
