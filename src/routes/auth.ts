/**
 * Authentication routes
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * Register new seller
 */
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  body('name').isString().trim().isLength({ min: 1, max: 100 }),
  body('company').optional().isString().trim().isLength({ max: 200 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, company } = req.body;

    // Mock user creation - in production, this would save to database
    const hashedPassword = await bcrypt.hash(password, 12);
    const sellerId = `seller_${Date.now()}`;

    const user = {
      id: sellerId,
      email,
      name,
      company,
      password: hashedPassword,
      role: 'seller',
      createdAt: new Date(),
    };

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        sellerId: user.id,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    logger.info(`New seller registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Seller registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        company: user.company,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Error registering seller:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Login seller
 */
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 1 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Mock user lookup - in production, this would query the database
    const user = {
      id: 'seller_123',
      email,
      name: 'John Smith',
      company: 'Tech Solutions Inc.',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/5.8.2.', // hashed 'password123'
      role: 'seller',
    };

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        sellerId: user.id,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    logger.info(`Seller logged in: ${email}`);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        company: user.company,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Error logging in seller:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Refresh token
 */
router.post('/refresh', [
  body('refreshToken').isString(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { refreshToken } = req.body;

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.secret) as any;
    
    // Generate new access token
    const newToken = jwt.sign(
      {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        sellerId: decoded.sellerId,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.json({
      success: true,
      token: newToken,
    });
  } catch (error) {
    logger.error('Error refreshing token:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

/**
 * Logout
 */
router.post('/logout', (req, res) => {
  // In a real implementation, you might want to blacklist the token
  logger.info('Seller logged out');
  res.json({
    success: true,
    message: 'Logout successful',
  });
});

export default router;