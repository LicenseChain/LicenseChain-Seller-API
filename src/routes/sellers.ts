/**
 * Seller management routes
 * Advanced seller analytics and management
 */

import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { SellerService } from '../services/SellerService';
import { AnalyticsService } from '../services/AnalyticsService';
import { logger } from '../utils/logger';

const router = express.Router();
const sellerService = new SellerService();
const analyticsService = new AnalyticsService();

/**
 * Get seller dashboard data
 */
router.get('/dashboard', async (req, res) => {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const dashboard = await sellerService.getDashboard(sellerId);
    res.json(dashboard);
  } catch (error) {
    logger.error('Error getting seller dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get seller profile
 */
router.get('/profile', async (req, res) => {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const profile = await sellerService.getProfile(sellerId);
    res.json(profile);
  } catch (error) {
    logger.error('Error getting seller profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Update seller profile
 */
router.put('/profile', [
  body('name').optional().isString().trim().isLength({ min: 1, max: 100 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('company').optional().isString().trim().isLength({ max: 200 }),
  body('website').optional().isURL(),
  body('description').optional().isString().trim().isLength({ max: 1000 }),
  body('contactInfo').optional().isObject(),
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

    const updatedProfile = await sellerService.updateProfile(sellerId, req.body);
    res.json(updatedProfile);
  } catch (error) {
    logger.error('Error updating seller profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get seller analytics
 */
router.get('/analytics', [
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
    logger.error('Error getting seller analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get seller's applications
 */
router.get('/applications', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['active', 'inactive', 'pending', 'suspended']),
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

    const { page = 1, limit = 20, status } = req.query;
    const applications = await sellerService.getApplications(sellerId, {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      status: status as string,
    });

    res.json(applications);
  } catch (error) {
    logger.error('Error getting seller applications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Create new application
 */
router.post('/applications', [
  body('name').isString().trim().isLength({ min: 1, max: 100 }),
  body('description').isString().trim().isLength({ max: 1000 }),
  body('category').isString().trim().isLength({ min: 1, max: 50 }),
  body('website').optional().isURL(),
  body('pricing').isObject(),
  body('features').isArray(),
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

    const application = await sellerService.createApplication(sellerId, req.body);
    res.status(201).json(application);
  } catch (error) {
    logger.error('Error creating application:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Update application
 */
router.put('/applications/:id', [
  param('id').isUUID(),
  body('name').optional().isString().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().isString().trim().isLength({ max: 1000 }),
  body('category').optional().isString().trim().isLength({ min: 1, max: 50 }),
  body('website').optional().isURL(),
  body('pricing').optional().isObject(),
  body('features').optional().isArray(),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'suspended']),
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

    const application = await sellerService.updateApplication(sellerId, req.params.id, req.body);
    res.json(application);
  } catch (error) {
    logger.error('Error updating application:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Delete application
 */
router.delete('/applications/:id', [
  param('id').isUUID(),
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

    await sellerService.deleteApplication(sellerId, req.params.id);
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting application:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get seller's revenue analytics
 */
router.get('/revenue', [
  query('period').optional().isIn(['7d', '30d', '90d', '1y', 'all']),
  query('groupBy').optional().isIn(['day', 'week', 'month', 'year']),
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

    const { period = '30d', groupBy = 'day' } = req.query;
    const revenue = await analyticsService.getRevenueAnalytics(sellerId, {
      period: period as string,
      groupBy: groupBy as string,
    });

    res.json(revenue);
  } catch (error) {
    logger.error('Error getting revenue analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get seller's license analytics
 */
router.get('/licenses', [
  query('period').optional().isIn(['7d', '30d', '90d', '1y', 'all']),
  query('status').optional().isIn(['active', 'expired', 'suspended', 'cancelled']),
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

    const { period = '30d', status } = req.query;
    const licenses = await analyticsService.getLicenseAnalytics(sellerId, {
      period: period as string,
      status: status as string,
    });

    res.json(licenses);
  } catch (error) {
    logger.error('Error getting license analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get seller's user analytics
 */
router.get('/users', [
  query('period').optional().isIn(['7d', '30d', '90d', '1y', 'all']),
  query('groupBy').optional().isIn(['day', 'week', 'month', 'year']),
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

    const { period = '30d', groupBy = 'day' } = req.query;
    const users = await analyticsService.getUserAnalytics(sellerId, {
      period: period as string,
      groupBy: groupBy as string,
    });

    res.json(users);
  } catch (error) {
    logger.error('Error getting user analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get seller's conversion analytics
 */
router.get('/conversions', [
  query('period').optional().isIn(['7d', '30d', '90d', '1y', 'all']),
  query('funnel').optional().isIn(['awareness', 'interest', 'consideration', 'purchase']),
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

    const { period = '30d', funnel } = req.query;
    const conversions = await analyticsService.getConversionAnalytics(sellerId, {
      period: period as string,
      funnel: funnel as string,
    });

    res.json(conversions);
  } catch (error) {
    logger.error('Error getting conversion analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
