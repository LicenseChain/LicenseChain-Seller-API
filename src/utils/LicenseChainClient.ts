import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Logger } from './logger';

export interface LicenseChainConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
}

export interface License {
  id: string;
  userId: string;
  productId: string;
  sellerId: string;
  licenseKey: string;
  status: 'active' | 'inactive' | 'expired' | 'suspended' | 'revoked';
  createdAt: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
}

export interface Payment {
  id: string;
  licenseId: string;
  sellerId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod: string;
  transactionId?: string;
  createdAt: string;
  completedAt?: string;
  metadata?: Record<string, any>;
}

export interface Refund {
  id: string;
  paymentId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  processedAt?: string;
  metadata?: Record<string, any>;
}

export interface Seller {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  sellerId: string;
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  metadata?: Record<string, any>;
}

export class LicenseChainClient {
  private client: AxiosInstance;
  private logger: Logger;

  constructor(config?: LicenseChainConfig) {
    this.logger = new Logger('LicenseChainClient');
    
    const apiKey = config?.apiKey || process.env.LICENSECHAIN_API_KEY;
    const baseUrl = config?.baseUrl || process.env.LICENSECHAIN_BASE_URL || 'https://api.licensechain.app';

    if (!apiKey) {
      throw new Error('LicenseChain API key is required');
    }

    this.client = axios.create({
      baseURL: baseUrl,
      timeout: config?.timeout || 30000,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-API-Version': '1.0',
        'X-Platform': 'seller-api'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        this.logger.debug(`Making request to ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        this.logger.debug(`Response received: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        this.logger.error('Response interceptor error:', error);
        return Promise.reject(error);
      }
    );
  }

  // License Management
  async createLicense(data: {
    userId: string;
    productId: string;
    sellerId: string;
    metadata?: Record<string, any>;
    expiresAt?: string;
  }): Promise<License> {
    try {
      const response: AxiosResponse<License> = await this.client.post('/licenses', data);
      return response.data;
    } catch (error) {
      this.logger.error('Error creating license:', error);
      throw error;
    }
  }

  async getLicense(licenseId: string): Promise<License> {
    try {
      const response: AxiosResponse<License> = await this.client.get(`/licenses/${licenseId}`);
      return response.data;
    } catch (error) {
      this.logger.error('Error getting license:', error);
      throw error;
    }
  }

  async updateLicense(licenseId: string, updates: Partial<License>): Promise<License> {
    try {
      const response: AxiosResponse<License> = await this.client.put(`/licenses/${licenseId}`, updates);
      return response.data;
    } catch (error) {
      this.logger.error('Error updating license:', error);
      throw error;
    }
  }

  async revokeLicense(licenseId: string, data?: { reason?: string; revokedBy?: string; revokedVia?: string }): Promise<void> {
    try {
      await this.client.delete(`/licenses/${licenseId}`, { data });
    } catch (error) {
      this.logger.error('Error revoking license:', error);
      throw error;
    }
  }

  async extendLicense(licenseId: string, days: number, metadata?: Record<string, any>): Promise<License> {
    try {
      const response: AxiosResponse<License> = await this.client.post(`/licenses/${licenseId}/extend`, {
        days,
        metadata
      });
      return response.data;
    } catch (error) {
      this.logger.error('Error extending license:', error);
      throw error;
    }
  }

  async getLicenses(filters: {
    sellerId?: string;
    userId?: string;
    productId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: License[]; total: number; page: number; limit: number }> {
    try {
      const response: AxiosResponse<{ data: License[]; total: number; page: number; limit: number }> = 
        await this.client.get('/licenses', { params: filters });
      return response.data;
    } catch (error) {
      this.logger.error('Error getting licenses:', error);
      throw error;
    }
  }

  async validateLicense(licenseKey: string): Promise<{ valid: boolean; license?: License; error?: string }> {
    try {
      const response: AxiosResponse<{ valid: boolean; license?: License; error?: string }> = 
        await this.client.post('/licenses/validate', { licenseKey });
      return response.data;
    } catch (error) {
      this.logger.error('Error validating license:', error);
      throw error;
    }
  }

  async getLicenseStats(filters: { sellerId?: string; productId?: string }): Promise<{
    total: number;
    active: number;
    expired: number;
    suspended: number;
    revoked: number;
    revenue: number;
  }> {
    try {
      const response: AxiosResponse<any> = await this.client.get('/licenses/stats', { params: filters });
      return response.data;
    } catch (error) {
      this.logger.error('Error getting license stats:', error);
      throw error;
    }
  }

  // Payment Management
  async createPayment(data: {
    licenseId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    sellerId: string;
    metadata?: Record<string, any>;
  }): Promise<Payment> {
    try {
      const response: AxiosResponse<Payment> = await this.client.post('/payments', data);
      return response.data;
    } catch (error) {
      this.logger.error('Error creating payment:', error);
      throw error;
    }
  }

  async getPayment(paymentId: string): Promise<Payment> {
    try {
      const response: AxiosResponse<Payment> = await this.client.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      this.logger.error('Error getting payment:', error);
      throw error;
    }
  }

  async updatePayment(paymentId: string, updates: Partial<Payment>): Promise<Payment> {
    try {
      const response: AxiosResponse<Payment> = await this.client.put(`/payments/${paymentId}`, updates);
      return response.data;
    } catch (error) {
      this.logger.error('Error updating payment:', error);
      throw error;
    }
  }

  async cancelPayment(paymentId: string, data?: { reason?: string; cancelledBy?: string; cancelledVia?: string }): Promise<void> {
    try {
      await this.client.delete(`/payments/${paymentId}`, { data });
    } catch (error) {
      this.logger.error('Error cancelling payment:', error);
      throw error;
    }
  }

  async getPayments(filters: {
    sellerId?: string;
    licenseId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Payment[]; total: number; page: number; limit: number }> {
    try {
      const response: AxiosResponse<{ data: Payment[]; total: number; page: number; limit: number }> = 
        await this.client.get('/payments', { params: filters });
      return response.data;
    } catch (error) {
      this.logger.error('Error getting payments:', error);
      throw error;
    }
  }

  async processRefund(paymentId: string, data: {
    amount: number;
    reason: string;
    processedBy?: string;
    processedVia?: string;
  }): Promise<Refund> {
    try {
      const response: AxiosResponse<Refund> = await this.client.post(`/payments/${paymentId}/refund`, data);
      return response.data;
    } catch (error) {
      this.logger.error('Error processing refund:', error);
      throw error;
    }
  }

  async getPaymentStats(filters: { sellerId?: string; period?: string }): Promise<{
    total: number;
    completed: number;
    failed: number;
    pending: number;
    refunded: number;
    revenue: number;
    averageAmount: number;
  }> {
    try {
      const response: AxiosResponse<any> = await this.client.get('/payments/stats', { params: filters });
      return response.data;
    } catch (error) {
      this.logger.error('Error getting payment stats:', error);
      throw error;
    }
  }

  async getRevenueReport(filters: {
    sellerId: string;
    startDate: string;
    endDate: string;
    groupBy?: string;
  }): Promise<{
    totalRevenue: number;
    totalTransactions: number;
    data: Array<{
      date: string;
      revenue: number;
      transactions: number;
    }>;
  }> {
    try {
      const response: AxiosResponse<any> = await this.client.get('/payments/revenue-report', { params: filters });
      return response.data;
    } catch (error) {
      this.logger.error('Error getting revenue report:', error);
      throw error;
    }
  }

  // Seller Management
  async getSeller(sellerId: string): Promise<Seller> {
    try {
      const response: AxiosResponse<Seller> = await this.client.get(`/sellers/${sellerId}`);
      return response.data;
    } catch (error) {
      this.logger.error('Error getting seller:', error);
      throw error;
    }
  }

  async updateSeller(sellerId: string, updates: Partial<Seller>): Promise<Seller> {
    try {
      const response: AxiosResponse<Seller> = await this.client.put(`/sellers/${sellerId}`, updates);
      return response.data;
    } catch (error) {
      this.logger.error('Error updating seller:', error);
      throw error;
    }
  }

  // User Management
  async getUser(userId: string): Promise<User> {
    try {
      const response: AxiosResponse<User> = await this.client.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      this.logger.error('Error getting user:', error);
      throw error;
    }
  }

  // Product Management
  async getProduct(productId: string): Promise<Product> {
    try {
      const response: AxiosResponse<Product> = await this.client.get(`/products/${productId}`);
      return response.data;
    } catch (error) {
      this.logger.error('Error getting product:', error);
      throw error;
    }
  }

  async getSellerProducts(sellerId: string, filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    try {
      const response: AxiosResponse<{ data: Product[]; total: number; page: number; limit: number }> = 
        await this.client.get(`/sellers/${sellerId}/products`, { params: filters });
      return response.data;
    } catch (error) {
      this.logger.error('Error getting seller products:', error);
      throw error;
    }
  }

  // Webhook Management
  async createWebhook(data: {
    url: string;
    events: string[];
    sellerId: string;
    secret?: string;
  }): Promise<{ id: string; url: string; events: string[]; secret: string }> {
    try {
      const response: AxiosResponse<any> = await this.client.post('/webhooks', data);
      return response.data;
    } catch (error) {
      this.logger.error('Error creating webhook:', error);
      throw error;
    }
  }

  async getWebhooks(sellerId: string): Promise<Array<{ id: string; url: string; events: string[]; status: string }>> {
    try {
      const response: AxiosResponse<any> = await this.client.get('/webhooks', { params: { sellerId } });
      return response.data;
    } catch (error) {
      this.logger.error('Error getting webhooks:', error);
      throw error;
    }
  }

  async deleteWebhook(webhookId: string): Promise<void> {
    try {
      await this.client.delete(`/webhooks/${webhookId}`);
    } catch (error) {
      this.logger.error('Error deleting webhook:', error);
      throw error;
    }
  }
}
