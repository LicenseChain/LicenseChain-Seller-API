/**
 * Payment routes
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import Stripe from 'stripe';
import { config } from '../config';
import { logger } from '../utils/logger';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2023-10-16',
});

const router = express.Router();

/**
 * Create payment intent
 */
router.post('/create-payment-intent', [
  body('amount').isInt({ min: 1 }),
  body('currency').isString().isLength({ min: 3, max: 3 }),
  body('description').optional().isString(),
  body('metadata').optional().isObject(),
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

    const { amount, currency, description, metadata } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: currency.toLowerCase(),
      description: description || 'LicenseChain payment',
      metadata: {
        sellerId,
        ...metadata,
      },
    });

    logger.info(`Payment intent created: ${paymentIntent.id} for seller: ${sellerId}`);

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    logger.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

/**
 * Create subscription
 */
router.post('/create-subscription', [
  body('priceId').isString(),
  body('customerId').optional().isString(),
  body('paymentMethodId').optional().isString(),
  body('trialPeriodDays').optional().isInt({ min: 0 }),
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

    const { priceId, customerId, paymentMethodId, trialPeriodDays } = req.body;

    let customer = customerId;
    if (!customer) {
      // Create customer if not provided
      customer = await stripe.customers.create({
        email: req.user?.email,
        name: req.user?.name,
        metadata: {
          sellerId,
        },
      });
    }

    const subscriptionData: Stripe.SubscriptionCreateParams = {
      customer: customer as string,
      items: [{ price: priceId }],
      metadata: {
        sellerId,
      },
    };

    if (trialPeriodDays) {
      subscriptionData.trial_period_days = trialPeriodDays;
    }

    if (paymentMethodId) {
      subscriptionData.default_payment_method = paymentMethodId;
    }

    const subscription = await stripe.subscriptions.create(subscriptionData);

    logger.info(`Subscription created: ${subscription.id} for seller: ${sellerId}`);

    res.json({
      success: true,
      subscriptionId: subscription.id,
      customerId: customer,
      status: subscription.status,
    });
  } catch (error) {
    logger.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

/**
 * Get payment methods
 */
router.get('/payment-methods', async (req, res) => {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Mock payment methods - in production, this would query Stripe
    const paymentMethods = [
      {
        id: 'pm_1234567890',
        type: 'card',
        card: {
          brand: 'visa',
          last4: '4242',
          expMonth: 12,
          expYear: 2025,
        },
        isDefault: true,
      },
      {
        id: 'pm_0987654321',
        type: 'card',
        card: {
          brand: 'mastercard',
          last4: '5555',
          expMonth: 8,
          expYear: 2026,
        },
        isDefault: false,
      },
    ];

    res.json({
      success: true,
      paymentMethods,
    });
  } catch (error) {
    logger.error('Error getting payment methods:', error);
    res.status(500).json({ error: 'Failed to get payment methods' });
  }
});

/**
 * Get invoices
 */
router.get('/invoices', async (req, res) => {
  try {
    const sellerId = req.user?.id;
    if (!sellerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { limit = 10, startingAfter } = req.query;

    // Mock invoices - in production, this would query Stripe
    const invoices = [
      {
        id: 'in_1234567890',
        amount: 9900,
        currency: 'usd',
        status: 'paid',
        created: 1640995200,
        description: 'LicenseChain Pro - Monthly',
        downloadUrl: '/api/payments/invoices/in_1234567890/download',
      },
      {
        id: 'in_0987654321',
        amount: 99900,
        currency: 'usd',
        status: 'paid',
        created: 1638403200,
        description: 'LicenseChain Pro - Yearly',
        downloadUrl: '/api/payments/invoices/in_0987654321/download',
      },
    ];

    res.json({
      success: true,
      invoices,
      hasMore: false,
    });
  } catch (error) {
    logger.error('Error getting invoices:', error);
    res.status(500).json({ error: 'Failed to get invoices' });
  }
});

/**
 * Download invoice
 */
router.get('/invoices/:invoiceId/download', async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const sellerId = req.user?.id;
    if (!sellerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Mock invoice download - in production, this would generate PDF
    const invoiceData = {
      id: invoiceId,
      amount: 9900,
      currency: 'usd',
      status: 'paid',
      created: new Date().toISOString(),
      description: 'LicenseChain Pro - Monthly',
      seller: {
        name: req.user?.name,
        email: req.user?.email,
        company: req.user?.company,
      },
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoiceId}.json"`);
    res.json(invoiceData);
  } catch (error) {
    logger.error('Error downloading invoice:', error);
    res.status(500).json({ error: 'Failed to download invoice' });
  }
});

/**
 * Create refund
 */
router.post('/refunds', [
  body('paymentIntentId').isString(),
  body('amount').optional().isInt({ min: 1 }),
  body('reason').optional().isIn(['duplicate', 'fraudulent', 'requested_by_customer']),
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

    const { paymentIntentId, amount, reason } = req.body;

    const refundData: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
      reason: reason || 'requested_by_customer',
    };

    if (amount) {
      refundData.amount = amount * 100; // Convert to cents
    }

    const refund = await stripe.refunds.create(refundData);

    logger.info(`Refund created: ${refund.id} for payment: ${paymentIntentId}`);

    res.json({
      success: true,
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount,
    });
  } catch (error) {
    logger.error('Error creating refund:', error);
    res.status(500).json({ error: 'Failed to create refund' });
  }
});

export default router;