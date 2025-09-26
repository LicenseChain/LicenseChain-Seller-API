/**
 * Analytics routes
 */

import express from 'express';
import { query, validationResult } from 'express-validator';
import { AnalyticsService } from '../services/AnalyticsService';
import { logger } from '../utils/logger';

const router = express.Router();
const analyticsService = new AnalyticsService();

/**
 * Get comprehensive analytics
 */
router.get('/', [
  query('period').optional().isIn(['7d', '30d', '90d', '1y', 'all']),
  query('metric').optional().isIn(['revenue', 'licenses', 'users', 'conversions']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const sellerId = req.user?.id;
    if (!sellerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { period = '30d', metric, startDate, endDate } = req.query;
    const analytics = await analyticsService.getSellerAnalytics(sellerId, {
      period: period as string,
      metric: metric as string,
      startDate: startDate as string,
      endDate: endDate as string,
    });

    res.json(analytics);
  } catch (error) {
    logger.error('Error getting analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get platform-wide analytics (admin only)
 */
router.get('/platform', [
  query('period').optional().isIn(['7d', '30d', '90d', '1y', 'all']),
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

    const { period = '30d' } = req.query;
    
    // Mock platform analytics
    const platformAnalytics = {
      totalSellers: 150,
      totalRevenue: 2500000,
      totalLicenses: 50000,
      totalUsers: 25000,
      revenueGrowth: 18.5,
      licenseGrowth: 22.3,
      userGrowth: 15.7,
      topSellers: [
        {
          id: 'seller-1',
          name: 'Tech Solutions Inc.',
          revenue: 125000,
          licenses: 2500,
        },
        {
          id: 'seller-2',
          name: 'Data Analytics Co.',
          revenue: 98000,
          licenses: 1800,
        },
        {
          id: 'seller-3',
          name: 'Business Intelligence Ltd.',
          revenue: 87000,
          licenses: 1600,
        },
      ],
      revenueByPeriod: analyticsService.generateRevenueByPeriod(period as string),
    };

    res.json(platformAnalytics);
  } catch (error) {
    logger.error('Error getting platform analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;