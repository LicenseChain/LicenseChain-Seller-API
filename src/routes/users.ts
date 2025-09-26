/**
 * User routes
 */

import express from 'express';
import { query, validationResult } from 'express-validator';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * Get seller's users
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('status').optional().isIn(['active', 'inactive', 'suspended']),
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

    const { page = 1, limit = 20, search, status } = req.query;

    // Mock user data - in production, this would query the database
    const users = [
      {
        id: 'user_1234567890',
        email: 'john.doe@example.com',
        name: 'John Doe',
        company: 'Tech Solutions Inc.',
        status: 'active',
        createdAt: '2024-01-15T00:00:00.000Z',
        lastLogin: '2024-01-20T00:00:00.000Z',
        totalLicenses: 3,
        activeLicenses: 2,
        totalSpent: 297,
        currency: 'USD',
        country: 'US',
        timezone: 'America/New_York',
      },
      {
        id: 'user_0987654321',
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        company: 'Data Analytics Co.',
        status: 'active',
        createdAt: '2024-01-10T00:00:00.000Z',
        lastLogin: '2024-01-19T00:00:00.000Z',
        totalLicenses: 1,
        activeLicenses: 1,
        totalSpent: 99,
        currency: 'USD',
        country: 'CA',
        timezone: 'America/Toronto',
      },
      {
        id: 'user_1122334455',
        email: 'bob.wilson@example.com',
        name: 'Bob Wilson',
        company: 'Business Intelligence Ltd.',
        status: 'inactive',
        createdAt: '2023-12-01T00:00:00.000Z',
        lastLogin: '2023-12-15T00:00:00.000Z',
        totalLicenses: 2,
        activeLicenses: 0,
        totalSpent: 198,
        currency: 'USD',
        country: 'GB',
        timezone: 'Europe/London',
      },
    ];

    // Filter by status if provided
    let filteredUsers = users;
    if (status) {
      filteredUsers = users.filter(user => user.status === status);
    }

    // Search functionality
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredUsers = filteredUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.company.toLowerCase().includes(searchTerm)
      );
    }

    // Pagination
    const startIndex = ((page as number) - 1) * (limit as number);
    const endIndex = startIndex + (limit as number);
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedUsers,
      pagination: {
        page: page as number,
        limit: limit as number,
        total: filteredUsers.length,
        pages: Math.ceil(filteredUsers.length / (limit as number)),
      },
    });
  } catch (error) {
    logger.error('Error getting users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get user details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user?.id;
    if (!sellerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Mock user details - in production, this would query the database
    const user = {
      id,
      email: 'john.doe@example.com',
      name: 'John Doe',
      company: 'Tech Solutions Inc.',
      status: 'active',
      createdAt: '2024-01-15T00:00:00.000Z',
      lastLogin: '2024-01-20T00:00:00.000Z',
      profile: {
        avatar: 'https://ui-avatars.com/api/?name=John+Doe',
        bio: 'Software developer and data enthusiast',
        website: 'https://johndoe.com',
        location: 'San Francisco, CA',
        timezone: 'America/New_York',
      },
      preferences: {
        notifications: true,
        marketing: false,
        language: 'en',
        currency: 'USD',
      },
      statistics: {
        totalLicenses: 3,
        activeLicenses: 2,
        expiredLicenses: 1,
        totalSpent: 297,
        currency: 'USD',
        totalValidations: 1250,
        averageValidationsPerDay: 41.7,
      },
      licenses: [
        {
          id: 'lic_1234567890',
          applicationName: 'Advanced Analytics Pro',
          status: 'active',
          plan: 'monthly',
          price: 99,
          currency: 'USD',
          expiresAt: '2024-02-15T00:00:00.000Z',
          createdAt: '2024-01-15T00:00:00.000Z',
        },
        {
          id: 'lic_0987654321',
          applicationName: 'Data Insights Suite',
          status: 'active',
          plan: 'yearly',
          price: 999,
          currency: 'USD',
          expiresAt: '2025-01-14T00:00:00.000Z',
          createdAt: '2024-01-14T00:00:00.000Z',
        },
      ],
      activity: [
        {
          action: 'license_created',
          description: 'Created license for Advanced Analytics Pro',
          timestamp: '2024-01-15T00:00:00.000Z',
        },
        {
          action: 'license_validated',
          description: 'Validated license LC-ABC123-DEF456-GHI789',
          timestamp: '2024-01-20T00:00:00.000Z',
        },
        {
          action: 'profile_updated',
          description: 'Updated profile information',
          timestamp: '2024-01-18T00:00:00.000Z',
        },
      ],
    };

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('Error getting user details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get user analytics
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

    // Mock user analytics - in production, this would query the database
    const analytics = {
      userId: id,
      period: period as string,
      totalValidations: 1250,
      uniqueApplications: 2,
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
      applicationUsage: [
        {
          applicationId: 'app_123',
          applicationName: 'Advanced Analytics Pro',
          validations: 850,
          percentage: 68,
        },
        {
          applicationId: 'app_456',
          applicationName: 'Data Insights Suite',
          validations: 400,
          percentage: 32,
        },
      ],
      geographicData: [
        { country: 'US', validations: 750, percentage: 60 },
        { country: 'CA', validations: 300, percentage: 24 },
        { country: 'GB', validations: 200, percentage: 16 },
      ],
      deviceData: [
        { device: 'Windows', validations: 600, percentage: 48 },
        { device: 'macOS', validations: 450, percentage: 36 },
        { device: 'Linux', validations: 200, percentage: 16 },
      ],
    };

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    logger.error('Error getting user analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Suspend user
 */
router.post('/:id/suspend', async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user?.id;
    if (!sellerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Mock user suspension - in production, this would update the database
    logger.info(`User suspended: ${id} by seller: ${sellerId}`);

    res.json({
      success: true,
      message: 'User suspended successfully',
    });
  } catch (error) {
    logger.error('Error suspending user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Reactivate user
 */
router.post('/:id/reactivate', async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user?.id;
    if (!sellerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Mock user reactivation - in production, this would update the database
    logger.info(`User reactivated: ${id} by seller: ${sellerId}`);

    res.json({
      success: true,
      message: 'User reactivated successfully',
    });
  } catch (error) {
    logger.error('Error reactivating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;