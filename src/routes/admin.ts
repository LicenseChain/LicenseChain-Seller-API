/**
 * Admin routes
 */

import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * Get platform statistics
 */
router.get('/stats', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Mock platform statistics - in production, this would query the database
    const stats = {
      overview: {
        totalSellers: 150,
        totalUsers: 25000,
        totalLicenses: 50000,
        totalRevenue: 2500000,
        currency: 'USD',
        activeApplications: 45,
        totalWebhooks: 1200,
      },
      growth: {
        sellersGrowth: 18.5,
        usersGrowth: 22.3,
        licensesGrowth: 25.7,
        revenueGrowth: 28.9,
        period: '30d',
      },
      recent: {
        newSellers: 12,
        newUsers: 1250,
        newLicenses: 2100,
        revenue: 125000,
        period: '7d',
      },
      topSellers: [
        {
          id: 'seller-1',
          name: 'Tech Solutions Inc.',
          email: 'contact@techsolutions.com',
          revenue: 125000,
          licenses: 2500,
          users: 1200,
          growth: 15.2,
        },
        {
          id: 'seller-2',
          name: 'Data Analytics Co.',
          email: 'info@dataanalytics.com',
          revenue: 98000,
          licenses: 1800,
          users: 950,
          growth: 22.8,
        },
        {
          id: 'seller-3',
          name: 'Business Intelligence Ltd.',
          email: 'hello@bintel.com',
          revenue: 87000,
          licenses: 1600,
          users: 800,
          growth: 18.5,
        },
      ],
      systemHealth: {
        apiUptime: 99.9,
        averageResponseTime: 45,
        errorRate: 0.1,
        activeConnections: 1250,
        databaseStatus: 'healthy',
        cacheStatus: 'healthy',
        queueStatus: 'healthy',
      },
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error getting platform stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get all sellers
 */
router.get('/sellers', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('status').optional().isIn(['active', 'suspended', 'pending']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { page = 1, limit = 20, search, status } = req.query;

    // Mock sellers data - in production, this would query the database
    const sellers = [
      {
        id: 'seller_1234567890',
        email: 'contact@techsolutions.com',
        name: 'Tech Solutions Inc.',
        company: 'Tech Solutions Inc.',
        status: 'active',
        createdAt: '2024-01-01T00:00:00.000Z',
        lastLogin: '2024-01-20T00:00:00.000Z',
        revenue: 125000,
        licenses: 2500,
        users: 1200,
        applications: 3,
        plan: 'enterprise',
        country: 'US',
        timezone: 'America/New_York',
      },
      {
        id: 'seller_0987654321',
        email: 'info@dataanalytics.com',
        name: 'Data Analytics Co.',
        company: 'Data Analytics Co.',
        status: 'active',
        createdAt: '2024-01-05T00:00:00.000Z',
        lastLogin: '2024-01-19T00:00:00.000Z',
        revenue: 98000,
        licenses: 1800,
        users: 950,
        applications: 2,
        plan: 'professional',
        country: 'CA',
        timezone: 'America/Toronto',
      },
      {
        id: 'seller_1122334455',
        email: 'hello@bintel.com',
        name: 'Business Intelligence Ltd.',
        company: 'Business Intelligence Ltd.',
        status: 'suspended',
        createdAt: '2023-12-15T00:00:00.000Z',
        lastLogin: '2024-01-10T00:00:00.000Z',
        revenue: 87000,
        licenses: 1600,
        users: 800,
        applications: 2,
        plan: 'professional',
        country: 'GB',
        timezone: 'Europe/London',
      },
    ];

    // Filter by status if provided
    let filteredSellers = sellers;
    if (status) {
      filteredSellers = sellers.filter(seller => seller.status === status);
    }

    // Search functionality
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredSellers = filteredSellers.filter(seller =>
        seller.name.toLowerCase().includes(searchTerm) ||
        seller.email.toLowerCase().includes(searchTerm) ||
        seller.company.toLowerCase().includes(searchTerm)
      );
    }

    // Pagination
    const startIndex = ((page as number) - 1) * (limit as number);
    const endIndex = startIndex + (limit as number);
    const paginatedSellers = filteredSellers.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedSellers,
      pagination: {
        page: page as number,
        limit: limit as number,
        total: filteredSellers.length,
        pages: Math.ceil(filteredSellers.length / (limit as number)),
      },
    });
  } catch (error) {
    logger.error('Error getting sellers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Suspend seller
 */
router.post('/sellers/:id/suspend', [
  body('reason').optional().isString(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { reason } = req.body;

    // Mock seller suspension - in production, this would update the database
    logger.info(`Seller suspended: ${id} by admin: ${req.user?.id}, reason: ${reason || 'No reason provided'}`);

    res.json({
      success: true,
      message: 'Seller suspended successfully',
    });
  } catch (error) {
    logger.error('Error suspending seller:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Reactivate seller
 */
router.post('/sellers/:id/reactivate', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    // Mock seller reactivation - in production, this would update the database
    logger.info(`Seller reactivated: ${id} by admin: ${req.user?.id}`);

    res.json({
      success: true,
      message: 'Seller reactivated successfully',
    });
  } catch (error) {
    logger.error('Error reactivating seller:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get system logs
 */
router.get('/logs', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('level').optional().isIn(['error', 'warn', 'info', 'debug']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { page = 1, limit = 50, level, startDate, endDate } = req.query;

    // Mock logs data - in production, this would query the log database
    const logs = [
      {
        id: 'log_1234567890',
        level: 'info',
        message: 'HTTP Request',
        timestamp: '2024-01-20T10:30:00.000Z',
        service: 'licensechain-seller-api',
        metadata: {
          method: 'GET',
          url: '/api/sellers',
          statusCode: 200,
          duration: '45ms',
          ip: '192.168.1.1',
        },
      },
      {
        id: 'log_0987654321',
        level: 'warn',
        message: 'Rate limit exceeded',
        timestamp: '2024-01-20T10:25:00.000Z',
        service: 'licensechain-seller-api',
        metadata: {
          ip: '192.168.1.2',
          endpoint: '/api/auth/login',
          limit: 100,
          window: '15m',
        },
      },
      {
        id: 'log_1122334455',
        level: 'error',
        message: 'Database connection failed',
        timestamp: '2024-01-20T10:20:00.000Z',
        service: 'licensechain-seller-api',
        metadata: {
          error: 'Connection timeout',
          retryCount: 3,
          database: 'postgresql',
        },
      },
    ];

    // Filter by level if provided
    let filteredLogs = logs;
    if (level) {
      filteredLogs = logs.filter(log => log.level === level);
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate as string) : new Date(0);
      const end = endDate ? new Date(endDate as string) : new Date();
      
      filteredLogs = filteredLogs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= start && logDate <= end;
      });
    }

    // Pagination
    const startIndex = ((page as number) - 1) * (limit as number);
    const endIndex = startIndex + (limit as number);
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedLogs,
      pagination: {
        page: page as number,
        limit: limit as number,
        total: filteredLogs.length,
        pages: Math.ceil(filteredLogs.length / (limit as number)),
      },
    });
  } catch (error) {
    logger.error('Error getting system logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get system health
 */
router.get('/health', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Mock system health - in production, this would check actual system status
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        api: {
          status: 'healthy',
          responseTime: 45,
          uptime: 99.9,
        },
        database: {
          status: 'healthy',
          responseTime: 12,
          connections: 25,
          maxConnections: 100,
        },
        cache: {
          status: 'healthy',
          responseTime: 2,
          hitRate: 95.2,
        },
        queue: {
          status: 'healthy',
          pendingJobs: 5,
          processedJobs: 1250,
        },
        storage: {
          status: 'healthy',
          usedSpace: '45.2GB',
          totalSpace: '100GB',
        },
      },
      metrics: {
        requestsPerMinute: 150,
        averageResponseTime: 45,
        errorRate: 0.1,
        activeUsers: 1250,
        memoryUsage: '2.1GB',
        cpuUsage: 35.2,
      },
    };

    res.json({
      success: true,
      data: health,
    });
  } catch (error) {
    logger.error('Error getting system health:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;