/**
 * Webhook routes
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import { config } from '../config';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * Stripe webhook handler
 */
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const payload = req.body;

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', config.stripe.webhookSecret)
      .update(payload)
      .digest('hex');

    if (signature !== expectedSignature) {
      logger.warn('Invalid Stripe webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(payload.toString());
    
    logger.info(`Stripe webhook received: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
      default:
        logger.info(`Unhandled Stripe event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Error processing Stripe webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * LicenseChain webhook handler
 */
router.post('/licensechain', [
  body('event').isString(),
  body('data').isObject(),
  body('timestamp').isISO8601(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { event, data, timestamp } = req.body;

    // Verify webhook signature
    const signature = req.headers['x-licensechain-signature'] as string;
    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', config.webhooks.secret)
      .update(payload)
      .digest('hex');

    if (signature !== `sha256=${expectedSignature}`) {
      logger.warn('Invalid LicenseChain webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    logger.info(`LicenseChain webhook received: ${event}`);

    switch (event) {
      case 'license.created':
        await handleLicenseCreated(data);
        break;
      case 'license.updated':
        await handleLicenseUpdated(data);
        break;
      case 'license.deleted':
        await handleLicenseDeleted(data);
        break;
      case 'user.registered':
        await handleUserRegistered(data);
        break;
      case 'user.updated':
        await handleUserUpdated(data);
        break;
      case 'application.created':
        await handleApplicationCreated(data);
        break;
      case 'application.updated':
        await handleApplicationUpdated(data);
        break;
      default:
        logger.info(`Unhandled LicenseChain event type: ${event}`);
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Error processing LicenseChain webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Stripe webhook handlers
async function handlePaymentSucceeded(paymentIntent: any) {
  logger.info(`Payment succeeded: ${paymentIntent.id}`);
  // Update license status, send confirmation email, etc.
}

async function handlePaymentFailed(paymentIntent: any) {
  logger.info(`Payment failed: ${paymentIntent.id}`);
  // Handle failed payment, notify user, etc.
}

async function handleSubscriptionCreated(subscription: any) {
  logger.info(`Subscription created: ${subscription.id}`);
  // Activate subscription, create recurring license, etc.
}

async function handleSubscriptionUpdated(subscription: any) {
  logger.info(`Subscription updated: ${subscription.id}`);
  // Update subscription details, modify license, etc.
}

async function handleSubscriptionDeleted(subscription: any) {
  logger.info(`Subscription deleted: ${subscription.id}`);
  // Deactivate subscription, revoke license, etc.
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  logger.info(`Invoice payment succeeded: ${invoice.id}`);
  // Process successful recurring payment
}

async function handleInvoicePaymentFailed(invoice: any) {
  logger.info(`Invoice payment failed: ${invoice.id}`);
  // Handle failed recurring payment
}

// LicenseChain webhook handlers
async function handleLicenseCreated(data: any) {
  logger.info(`License created: ${data.id}`);
  // Update seller analytics, send notification, etc.
}

async function handleLicenseUpdated(data: any) {
  logger.info(`License updated: ${data.id}`);
  // Update license details, sync with seller system, etc.
}

async function handleLicenseDeleted(data: any) {
  logger.info(`License deleted: ${data.id}`);
  // Remove from seller analytics, update counts, etc.
}

async function handleUserRegistered(data: any) {
  logger.info(`User registered: ${data.id}`);
  // Update user analytics, send welcome email, etc.
}

async function handleUserUpdated(data: any) {
  logger.info(`User updated: ${data.id}`);
  // Sync user data with seller system, etc.
}

async function handleApplicationCreated(data: any) {
  logger.info(`Application created: ${data.id}`);
  // Update seller analytics, notify seller, etc.
}

async function handleApplicationUpdated(data: any) {
  logger.info(`Application updated: ${data.id}`);
  // Sync application data, update analytics, etc.
}

export default router;