/**
 * License routes
 */

import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * Get seller's licenses
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['active', 'expired', 'suspended', 'cancelled']),
  query('search').optional().isString(),
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

    const { page = 1, limit = 20, status, search } = req.query;

    // Mock license data - in production, this would query the database
    const licenses = [
      {
        id: 'lic_1234567890',
        key: 'LC-ABC123-DEF456-GHI789',
        applicationId: 'app_123',
        applicationName: 'Advanced Analytics Pro',
        userId: 'user_456',
        userEmail: 'user@example.com',
        status: 'active',
        plan: 'monthly',
        price: 99,
        currency: 'USD',
        expiresAt: '2024-02-15T00:00:00.000Z',
        createdAt: '2024-01-15T00:00:00.000Z',
        features: ['Real-time analytics', 'Custom dashboards', 'API access'],
        usage: {
          totalValidations: 1250,
          lastValidated: '2024-01-20T00:00:00.000Z',
          maxValidations: -1, // Unlimited
        },
      },
      {
        id: 'lic_0987654321',
        key: 'LC-XYZ789-UVW456-RST123',
        applicationId: 'app_456',
        applicationName: 'Data Insights Suite',
        userId: 'user_789',
        userEmail: 'user2@example.com',
        status: 'active',
        plan: 'yearly',
        price: 999,
        currency: 'USD',
        expiresAt: '2025-01-14T00:00:00.000Z',
        createdAt: '2024-01-14T00:00:00.000Z',
        features: ['AI insights', 'Data visualization', 'Machine learning'],
        usage: {
          totalValidations: 850,
          lastValidated: '2024-01-19T00:00:00.000Z',
          maxValidations: -1, // Unlimited
        },
      },
    ];

    // Filter by status if provided
    let filteredLicenses = licenses;
    if (status) {
      filteredLicenses = licenses.filter(license => license.status === status);
    }

    // Search functionality
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredLicenses = filteredLicenses.filter(license =>
        license.applicationName.toLowerCase().includes(searchTerm) ||
        license.key.toLowerCase().includes(searchTerm) ||
        license.userEmail.toLowerCase().includes(searchTerm)
      );
    }

    // Pagination
    const startIndex = ((page as number) - 1) * (limit as number);
    const endIndex = startIndex + (limit as number);
    const paginatedLicenses = filteredLicenses.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedLicenses,
      pagination: {
        page: page as number,
        limit: limit as number,
        total: filteredLicenses.length,
        pages: Math.ceil(filteredLicenses.length / (limit as number)),
      },
    });
  } catch (error) {
    logger.error('Error getting licenses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get license details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user?.id;
    if (!sellerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Mock license details - in production, this would query the database
    const license = {
      id,
      key: 'LC-ABC123-DEF456-GHI789',
      applicationId: 'app_123',
      applicationName: 'Advanced Analytics Pro',
      userId: 'user_456',
      userEmail: 'user@example.com',
      status: 'active',
      plan: 'monthly',
      price: 99,
      currency: 'USD',
      expiresAt: '2024-02-15T00:00:00.000Z',
      createdAt: '2024-01-15T00:00:00.000Z',
      features: ['Real-time analytics', 'Custom dashboards', 'API access'],
      usage: {
        totalValidations: 1250,
        lastValidated: '2024-01-20T00:00:00.000Z',
        maxValidations: -1, // Unlimited
      },
      hardware: [
        {
          id: 'hw_123',
          fingerprint: 'abc123def456',
          name: 'MacBook Pro',
          lastSeen: '2024-01-20T00:00:00.000Z',
        },
      ],
      history: [
        {
          action: 'created',
          timestamp: '2024-01-15T00:00:00.000Z',
          details: 'License created by seller',
        },
        {
          action: 'validated',
          timestamp: '2024-01-20T00:00:00.000Z',
          details: 'License validated successfully',
        },
      ],
    };

    res.json({
      success: true,
      data: license,
    });
  } catch (error) {
    logger.error('Error getting license details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Create new license
 */
router.post('/', [
  body('applicationId').isString(),
  body('userId').isString(),
  body('plan').isIn(['monthly', 'yearly', 'lifetime']),
  body('price').isInt({ min: 0 }),
  body('currency').isString().isLength({ min: 3, max: 3 }),
  body('features').optional().isArray(),
  body('maxValidations').optional().isInt({ min: -1 }),
  body('expiresAt').optional().isISO8601(),
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

    const {
      applicationId,
      userId,
      plan,
      price,
      currency,
      features = [],
      maxValidations = -1,
      expiresAt,
    } = req.body;

    // Generate license key
    const licenseKey = `LC-${Math.random().toString(36).substr(2, 9).toUpperCase()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Calculate expiration date
    const expirationDate = expiresAt || (() => {
      const now = new Date();
      if (plan === 'monthly') {
        now.setMonth(now.getMonth() + 1);
      } else if (plan === 'yearly') {
        now.setFullYear(now.getFullYear() + 1);
      } else if (plan === 'lifetime') {
        now.setFullYear(now.getFullYear() + 100);
      }
      return now.toISOString();
    })();

    const license = {
      id: `lic_${Date.now()}`,
      key: licenseKey,
      applicationId,
      userId,
      plan,
      price,
      currency,
      features,
      maxValidations,
      status: 'active',
      expiresAt: expirationDate,
      createdAt: new Date().toISOString(),
      sellerId,
    };

    logger.info(`License created: ${license.id} for seller: ${sellerId}`);

    res.status(201).json({
      success: true,
      data: license,
      message: 'License created successfully',
    });
  } catch (error) {
    logger.error('Error creating license:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Update license
 */
router.put('/:id', [
  body('status').optional().isIn(['active', 'suspended', 'cancelled']),
  body('features').optional().isArray(),
  body('maxValidations').optional().isInt({ min: -1 }),
  body('expiresAt').optional().isISO8601(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const sellerId = req.user?.id;
    if (!sellerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { status, features, maxValidations, expiresAt } = req.body;

    // Mock license update - in production, this would update the database
    const updatedLicense = {
      id,
      status: status || 'active',
      features: features || ['Real-time analytics', 'Custom dashboards', 'API access'],
      maxValidations: maxValidations || -1,
      expiresAt: expiresAt || '2024-02-15T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
    };

    logger.info(`License updated: ${id} by seller: ${sellerId}`);

    res.json({
      success: true,
      data: updatedLicense,
      message: 'License updated successfully',
    });
  } catch (error) {
    logger.error('Error updating license:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Revoke license
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user?.id;
    if (!sellerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Mock license revocation - in production, this would update the database
    logger.info(`License revoked: ${id} by seller: ${sellerId}`);

    res.json({
      success: true,
      message: 'License revoked successfully',
    });
  } catch (error) {
    logger.error('Error revoking license:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get license usage analytics
 */
router.get('/:id/analytics', [
  query('period').optional().isIn(['7d', '30d', '90d', '1y']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { period = '30d' } = req.query;
    const sellerId = req.user?.id;
    if (!sellerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Mock analytics data - in production, this would query the database
    const analytics = {
      licenseId: id,
      period: period as string,
      totalValidations: 1250,
      uniqueUsers: 15,
      averageValidationsPerDay: 41.7,
      peakUsage: {
        date: '2024-01-20',
        validations: 85,
      },
      usageByDay: [
        { date: '2024-01-01', validations: 45 },
        { date: '2024-01-02', validations: 52 },
        { date: '2024-01-03', validations: 38 },
        { date: '2024-01-04', validations: 61 },
        { date: '2024-01-05', validations: 47 },
        { date: '2024-01-06', validations: 55 },
        { date: '2024-01-07', validations: 42 },
      ],
      topFeatures: [
        { name: 'Real-time Analytics', usage: 85, trend: 'up' },
        { name: 'Custom Dashboards', usage: 72, trend: 'up' },
        { name: 'API Access', usage: 68, trend: 'down' },
      ],
    };

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    logger.error('Error getting license analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;