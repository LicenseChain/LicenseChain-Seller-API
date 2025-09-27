import { Request, Response } from 'express';
import { LicenseChainClient } from '../utils/LicenseChainClient';
import { Logger } from '../utils/logger';

export class LicenseService {
  private licenseClient: LicenseChainClient;
  private logger: Logger;

  constructor() {
    this.licenseClient = new LicenseChainClient();
    this.logger = new Logger('LicenseService');
  }

  async createLicense(req: Request, res: Response): Promise<void> {
    try {
      const { userId, productId, metadata, expiresAt } = req.body;
      const sellerId = req.user?.id;

      if (!userId || !productId) {
        res.status(400).json({
          success: false,
          error: 'User ID and Product ID are required'
        });
        return;
      }

      const license = await this.licenseClient.createLicense({
        userId,
        productId,
        sellerId,
        metadata: {
          ...metadata,
          createdVia: 'seller-api',
          sellerId
        },
        expiresAt
      });

      this.logger.info(`License created: ${license.id} for user ${userId} by seller ${sellerId}`);

      res.status(201).json({
        success: true,
        data: license
      });
    } catch (error) {
      this.logger.error('Error creating license:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create license'
      });
    }
  }

  async getLicense(req: Request, res: Response): Promise<void> {
    try {
      const { licenseId } = req.params;
      const sellerId = req.user?.id;

      const license = await this.licenseClient.getLicense(licenseId);

      if (!license || license.sellerId !== sellerId) {
        res.status(404).json({
          success: false,
          error: 'License not found'
        });
        return;
      }

      res.json({
        success: true,
        data: license
      });
    } catch (error) {
      this.logger.error('Error getting license:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get license'
      });
    }
  }

  async updateLicense(req: Request, res: Response): Promise<void> {
    try {
      const { licenseId } = req.params;
      const updates = req.body;
      const sellerId = req.user?.id;

      const license = await this.licenseClient.getLicense(licenseId);

      if (!license || license.sellerId !== sellerId) {
        res.status(404).json({
          success: false,
          error: 'License not found'
        });
        return;
      }

      const updatedLicense = await this.licenseClient.updateLicense(licenseId, {
        ...updates,
        updatedVia: 'seller-api',
        updatedBy: sellerId
      });

      this.logger.info(`License updated: ${licenseId} by seller ${sellerId}`);

      res.json({
        success: true,
        data: updatedLicense
      });
    } catch (error) {
      this.logger.error('Error updating license:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update license'
      });
    }
  }

  async revokeLicense(req: Request, res: Response): Promise<void> {
    try {
      const { licenseId } = req.params;
      const { reason } = req.body;
      const sellerId = req.user?.id;

      const license = await this.licenseClient.getLicense(licenseId);

      if (!license || license.sellerId !== sellerId) {
        res.status(404).json({
          success: false,
          error: 'License not found'
        });
        return;
      }

      await this.licenseClient.revokeLicense(licenseId, {
        reason,
        revokedBy: sellerId,
        revokedVia: 'seller-api'
      });

      this.logger.info(`License revoked: ${licenseId} by seller ${sellerId}`);

      res.json({
        success: true,
        message: 'License revoked successfully'
      });
    } catch (error) {
      this.logger.error('Error revoking license:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to revoke license'
      });
    }
  }

  async extendLicense(req: Request, res: Response): Promise<void> {
    try {
      const { licenseId } = req.params;
      const { days } = req.body;
      const sellerId = req.user?.id;

      if (!days || days <= 0) {
        res.status(400).json({
          success: false,
          error: 'Valid number of days is required'
        });
        return;
      }

      const license = await this.licenseClient.getLicense(licenseId);

      if (!license || license.sellerId !== sellerId) {
        res.status(404).json({
          success: false,
          error: 'License not found'
        });
        return;
      }

      const extendedLicense = await this.licenseClient.extendLicense(licenseId, days, {
        extendedBy: sellerId,
        extendedVia: 'seller-api'
      });

      this.logger.info(`License extended: ${licenseId} by ${days} days by seller ${sellerId}`);

      res.json({
        success: true,
        data: extendedLicense
      });
    } catch (error) {
      this.logger.error('Error extending license:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to extend license'
      });
    }
  }

  async getSellerLicenses(req: Request, res: Response): Promise<void> {
    try {
      const sellerId = req.user?.id;
      const { page = 1, limit = 10, status, productId } = req.query;

      const filters: any = { sellerId };
      if (status) filters.status = status;
      if (productId) filters.productId = productId;

      const licenses = await this.licenseClient.getLicenses({
        ...filters,
        page: Number(page),
        limit: Number(limit)
      });

      res.json({
        success: true,
        data: licenses
      });
    } catch (error) {
      this.logger.error('Error getting seller licenses:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get licenses'
      });
    }
  }

  async validateLicense(req: Request, res: Response): Promise<void> {
    try {
      const { licenseKey } = req.body;

      if (!licenseKey) {
        res.status(400).json({
          success: false,
          error: 'License key is required'
        });
        return;
      }

      const validation = await this.licenseClient.validateLicense(licenseKey);

      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      this.logger.error('Error validating license:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to validate license'
      });
    }
  }

  async getLicenseStats(req: Request, res: Response): Promise<void> {
    try {
      const sellerId = req.user?.id;

      const stats = await this.licenseClient.getLicenseStats({
        sellerId
      });

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      this.logger.error('Error getting license stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get license statistics'
      });
    }
  }
}
