import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { Logger } from './logger';

export interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  timestamp: string;
  sellerId: string;
}

export interface WebhookConfig {
  secret: string;
  tolerance?: number; // seconds
}

export class WebhookHandler {
  private logger: Logger;
  private config: WebhookConfig;

  constructor(config: WebhookConfig) {
    this.logger = new Logger('WebhookHandler');
    this.config = {
      tolerance: 300, // 5 minutes default
      ...config
    };
  }

  createSignature(payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');
  }

  verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = this.createSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  verifyWebhook(req: Request, res: Response, next: NextFunction): void {
    try {
      const signature = req.headers['x-licensechain-signature'] as string;
      const timestamp = req.headers['x-licensechain-timestamp'] as string;
      
      if (!signature || !timestamp) {
        this.logger.warn('Missing webhook signature or timestamp');
        res.status(401).json({
          success: false,
          error: 'Missing webhook signature or timestamp'
        });
        return;
      }

      // Check timestamp tolerance
      const currentTime = Math.floor(Date.now() / 1000);
      const webhookTime = parseInt(timestamp);
      
      if (Math.abs(currentTime - webhookTime) > this.config.tolerance!) {
        this.logger.warn('Webhook timestamp too old');
        res.status(401).json({
          success: false,
          error: 'Webhook timestamp too old'
        });
        return;
      }

      // Verify signature
      const payload = JSON.stringify(req.body);
      const expectedSignature = this.createSignature(payload, this.config.secret);
      
      if (!crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      )) {
        this.logger.warn('Invalid webhook signature');
        res.status(401).json({
          success: false,
          error: 'Invalid webhook signature'
        });
        return;
      }

      this.logger.info('Webhook signature verified successfully');
      next();
    } catch (error) {
      this.logger.error('Error verifying webhook:', error);
      res.status(500).json({
        success: false,
        error: 'Webhook verification failed'
      });
    }
  }

  processWebhookEvent(event: WebhookEvent): void {
    this.logger.info(`Processing webhook event: ${event.type} for seller ${event.sellerId}`);
    
    switch (event.type) {
      case 'license.created':
        this.handleLicenseCreated(event);
        break;
      case 'license.updated':
        this.handleLicenseUpdated(event);
        break;
      case 'license.revoked':
        this.handleLicenseRevoked(event);
        break;
      case 'license.expired':
        this.handleLicenseExpired(event);
        break;
      case 'payment.completed':
        this.handlePaymentCompleted(event);
        break;
      case 'payment.failed':
        this.handlePaymentFailed(event);
        break;
      case 'payment.refunded':
        this.handlePaymentRefunded(event);
        break;
      case 'user.created':
        this.handleUserCreated(event);
        break;
      case 'user.updated':
        this.handleUserUpdated(event);
        break;
      case 'product.created':
        this.handleProductCreated(event);
        break;
      case 'product.updated':
        this.handleProductUpdated(event);
        break;
      default:
        this.logger.warn(`Unknown webhook event type: ${event.type}`);
    }
  }

  private handleLicenseCreated(event: WebhookEvent): void {
    this.logger.info(`License created: ${event.data.id} for user ${event.data.userId}`);
    // Add custom logic for license created event
  }

  private handleLicenseUpdated(event: WebhookEvent): void {
    this.logger.info(`License updated: ${event.data.id}`);
    // Add custom logic for license updated event
  }

  private handleLicenseRevoked(event: WebhookEvent): void {
    this.logger.info(`License revoked: ${event.data.id}`);
    // Add custom logic for license revoked event
  }

  private handleLicenseExpired(event: WebhookEvent): void {
    this.logger.info(`License expired: ${event.data.id}`);
    // Add custom logic for license expired event
  }

  private handlePaymentCompleted(event: WebhookEvent): void {
    this.logger.info(`Payment completed: ${event.data.id} for license ${event.data.licenseId}`);
    // Add custom logic for payment completed event
  }

  private handlePaymentFailed(event: WebhookEvent): void {
    this.logger.info(`Payment failed: ${event.data.id} for license ${event.data.licenseId}`);
    // Add custom logic for payment failed event
  }

  private handlePaymentRefunded(event: WebhookEvent): void {
    this.logger.info(`Payment refunded: ${event.data.id} for license ${event.data.licenseId}`);
    // Add custom logic for payment refunded event
  }

  private handleUserCreated(event: WebhookEvent): void {
    this.logger.info(`User created: ${event.data.id}`);
    // Add custom logic for user created event
  }

  private handleUserUpdated(event: WebhookEvent): void {
    this.logger.info(`User updated: ${event.data.id}`);
    // Add custom logic for user updated event
  }

  private handleProductCreated(event: WebhookEvent): void {
    this.logger.info(`Product created: ${event.data.id} for seller ${event.data.sellerId}`);
    // Add custom logic for product created event
  }

  private handleProductUpdated(event: WebhookEvent): void {
    this.logger.info(`Product updated: ${event.data.id}`);
    // Add custom logic for product updated event
  }
}

export const createWebhookSignature = (payload: string, secret: string): string => {
  return crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
};

export const verifyWebhookSignature = (payload: string, signature: string, secret: string): boolean => {
  const expectedSignature = createWebhookSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
};

export const webhookMiddleware = (secret: string) => {
  const handler = new WebhookHandler({ secret });
  return handler.verifyWebhook.bind(handler);
};

export const processWebhookEvent = (event: WebhookEvent, secret: string): void => {
  const handler = new WebhookHandler({ secret });
  handler.processWebhookEvent(event);
};
