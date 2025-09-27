import { Request, Response } from 'express';
import { LicenseChainClient } from '../utils/LicenseChainClient';
import { Logger } from '../utils/logger';

export class PaymentService {
  private licenseClient: LicenseChainClient;
  private logger: Logger;

  constructor() {
    this.licenseClient = new LicenseChainClient();
    this.logger = new Logger('PaymentService');
  }

  async createPayment(req: Request, res: Response): Promise<void> {
    try {
      const { 
        licenseId, 
        amount, 
        currency = 'USD', 
        paymentMethod, 
        metadata 
      } = req.body;
      const sellerId = req.user?.id;

      if (!licenseId || !amount || !paymentMethod) {
        res.status(400).json({
          success: false,
          error: 'License ID, amount, and payment method are required'
        });
        return;
      }

      // Verify license belongs to seller
      const license = await this.licenseClient.getLicense(licenseId);
      if (!license || license.sellerId !== sellerId) {
        res.status(404).json({
          success: false,
          error: 'License not found'
        });
        return;
      }

      const payment = await this.licenseClient.createPayment({
        licenseId,
        amount,
        currency,
        paymentMethod,
        sellerId,
        metadata: {
          ...metadata,
          createdVia: 'seller-api'
        }
      });

      this.logger.info(`Payment created: ${payment.id} for license ${licenseId} by seller ${sellerId}`);

      res.status(201).json({
        success: true,
        data: payment
      });
    } catch (error) {
      this.logger.error('Error creating payment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create payment'
      });
    }
  }

  async getPayment(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;
      const sellerId = req.user?.id;

      const payment = await this.licenseClient.getPayment(paymentId);

      if (!payment || payment.sellerId !== sellerId) {
        res.status(404).json({
          success: false,
          error: 'Payment not found'
        });
        return;
      }

      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      this.logger.error('Error getting payment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get payment'
      });
    }
  }

  async updatePayment(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;
      const updates = req.body;
      const sellerId = req.user?.id;

      const payment = await this.licenseClient.getPayment(paymentId);

      if (!payment || payment.sellerId !== sellerId) {
        res.status(404).json({
          success: false,
          error: 'Payment not found'
        });
        return;
      }

      const updatedPayment = await this.licenseClient.updatePayment(paymentId, {
        ...updates,
        updatedVia: 'seller-api',
        updatedBy: sellerId
      });

      this.logger.info(`Payment updated: ${paymentId} by seller ${sellerId}`);

      res.json({
        success: true,
        data: updatedPayment
      });
    } catch (error) {
      this.logger.error('Error updating payment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update payment'
      });
    }
  }

  async cancelPayment(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;
      const { reason } = req.body;
      const sellerId = req.user?.id;

      const payment = await this.licenseClient.getPayment(paymentId);

      if (!payment || payment.sellerId !== sellerId) {
        res.status(404).json({
          success: false,
          error: 'Payment not found'
        });
        return;
      }

      await this.licenseClient.cancelPayment(paymentId, {
        reason,
        cancelledBy: sellerId,
        cancelledVia: 'seller-api'
      });

      this.logger.info(`Payment cancelled: ${paymentId} by seller ${sellerId}`);

      res.json({
        success: true,
        message: 'Payment cancelled successfully'
      });
    } catch (error) {
      this.logger.error('Error cancelling payment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel payment'
      });
    }
  }

  async getSellerPayments(req: Request, res: Response): Promise<void> {
    try {
      const sellerId = req.user?.id;
      const { page = 1, limit = 10, status, licenseId, startDate, endDate } = req.query;

      const filters: any = { sellerId };
      if (status) filters.status = status;
      if (licenseId) filters.licenseId = licenseId;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const payments = await this.licenseClient.getPayments({
        ...filters,
        page: Number(page),
        limit: Number(limit)
      });

      res.json({
        success: true,
        data: payments
      });
    } catch (error) {
      this.logger.error('Error getting seller payments:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get payments'
      });
    }
  }

  async processRefund(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;
      const { amount, reason } = req.body;
      const sellerId = req.user?.id;

      if (!amount || amount <= 0) {
        res.status(400).json({
          success: false,
          error: 'Valid refund amount is required'
        });
        return;
      }

      const payment = await this.licenseClient.getPayment(paymentId);

      if (!payment || payment.sellerId !== sellerId) {
        res.status(404).json({
          success: false,
          error: 'Payment not found'
        });
        return;
      }

      const refund = await this.licenseClient.processRefund(paymentId, {
        amount,
        reason,
        processedBy: sellerId,
        processedVia: 'seller-api'
      });

      this.logger.info(`Refund processed: ${refund.id} for payment ${paymentId} by seller ${sellerId}`);

      res.json({
        success: true,
        data: refund
      });
    } catch (error) {
      this.logger.error('Error processing refund:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process refund'
      });
    }
  }

  async getPaymentStats(req: Request, res: Response): Promise<void> {
    try {
      const sellerId = req.user?.id;
      const { period = '30d' } = req.query;

      const stats = await this.licenseClient.getPaymentStats({
        sellerId,
        period: period as string
      });

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      this.logger.error('Error getting payment stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get payment statistics'
      });
    }
  }

  async getRevenueReport(req: Request, res: Response): Promise<void> {
    try {
      const sellerId = req.user?.id;
      const { startDate, endDate, groupBy = 'day' } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: 'Start date and end date are required'
        });
        return;
      }

      const report = await this.licenseClient.getRevenueReport({
        sellerId,
        startDate: startDate as string,
        endDate: endDate as string,
        groupBy: groupBy as string
      });

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      this.logger.error('Error getting revenue report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get revenue report'
      });
    }
  }
}
