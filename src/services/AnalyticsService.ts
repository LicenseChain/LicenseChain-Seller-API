/**
 * Analytics Service
 * Advanced analytics and reporting for sellers
 */

import { logger } from '../utils/logger';

export interface AnalyticsOptions {
  period: string;
  metric?: string;
  startDate?: string;
  endDate?: string;
  groupBy?: string;
  status?: string;
  funnel?: string;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  revenueGrowth: number;
  averageOrderValue: number;
  revenueByPeriod: Array<{
    period: string;
    revenue: number;
  }>;
  revenueByApplication: Array<{
    applicationId: string;
    applicationName: string;
    revenue: number;
    percentage: number;
  }>;
  revenueByPlan: Array<{
    plan: string;
    revenue: number;
    percentage: number;
  }>;
}

export interface LicenseAnalytics {
  totalLicenses: number;
  activeLicenses: number;
  expiredLicenses: number;
  suspendedLicenses: number;
  licenseGrowth: number;
  licensesByPeriod: Array<{
    period: string;
    licenses: number;
  }>;
  licensesByApplication: Array<{
    applicationId: string;
    applicationName: string;
    licenses: number;
    percentage: number;
  }>;
  licensesByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

export interface UserAnalytics {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  userGrowth: number;
  usersByPeriod: Array<{
    period: string;
    users: number;
  }>;
  usersByApplication: Array<{
    applicationId: string;
    applicationName: string;
    users: number;
    percentage: number;
  }>;
  userRetention: Array<{
    period: string;
    retentionRate: number;
  }>;
}

export interface ConversionAnalytics {
  totalConversions: number;
  conversionRate: number;
  conversionGrowth: number;
  conversionsByPeriod: Array<{
    period: string;
    conversions: number;
  }>;
  conversionsByFunnel: Array<{
    stage: string;
    conversions: number;
    conversionRate: number;
  }>;
  conversionsBySource: Array<{
    source: string;
    conversions: number;
    percentage: number;
  }>;
}

export class AnalyticsService {
  /**
   * Get seller analytics
   */
  async getSellerAnalytics(sellerId: string, options: AnalyticsOptions): Promise<Record<string, any>> {
    try {
      const { period, metric } = options;
      
      let analytics: Record<string, any> = {};

      switch (metric) {
        case 'revenue':
          analytics = await this.getRevenueAnalytics(sellerId, options);
          break;
        case 'licenses':
          analytics = await this.getLicenseAnalytics(sellerId, options);
          break;
        case 'users':
          analytics = await this.getUserAnalytics(sellerId, options);
          break;
        case 'conversions':
          analytics = await this.getConversionAnalytics(sellerId, options);
          break;
        default:
          // Return all metrics
          analytics = {
            revenue: await this.getRevenueAnalytics(sellerId, options),
            licenses: await this.getLicenseAnalytics(sellerId, options),
            users: await this.getUserAnalytics(sellerId, options),
            conversions: await this.getConversionAnalytics(sellerId, options),
          };
      }

      return analytics;
    } catch (error) {
      logger.error('Error getting seller analytics:', error);
      throw error;
    }
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(sellerId: string, options: AnalyticsOptions): Promise<RevenueAnalytics> {
    try {
      // Mock data - in production, this would query the database
      const totalRevenue = 125000;
      const revenueGrowth = 15.5;
      const averageOrderValue = 299.99;

      const revenueByPeriod = this.generateRevenueByPeriod(options.period);
      const revenueByApplication = [
        {
          applicationId: 'app-1',
          applicationName: 'Advanced Analytics Pro',
          revenue: 45000,
          percentage: 36.0,
        },
        {
          applicationId: 'app-2',
          applicationName: 'Data Insights Suite',
          revenue: 32000,
          percentage: 25.6,
        },
        {
          applicationId: 'app-3',
          applicationName: 'Business Intelligence Tool',
          revenue: 28000,
          percentage: 22.4,
        },
        {
          applicationId: 'app-4',
          applicationName: 'Other Applications',
          revenue: 20000,
          percentage: 16.0,
        },
      ];

      const revenueByPlan = [
        {
          plan: 'Monthly',
          revenue: 75000,
          percentage: 60.0,
        },
        {
          plan: 'Yearly',
          revenue: 40000,
          percentage: 32.0,
        },
        {
          plan: 'Enterprise',
          revenue: 10000,
          percentage: 8.0,
        },
      ];

      return {
        totalRevenue,
        revenueGrowth,
        averageOrderValue,
        revenueByPeriod,
        revenueByApplication,
        revenueByPlan,
      };
    } catch (error) {
      logger.error('Error getting revenue analytics:', error);
      throw error;
    }
  }

  /**
   * Get license analytics
   */
  async getLicenseAnalytics(sellerId: string, options: AnalyticsOptions): Promise<LicenseAnalytics> {
    try {
      // Mock data - in production, this would query the database
      const totalLicenses = 2500;
      const activeLicenses = 2200;
      const expiredLicenses = 200;
      const suspendedLicenses = 100;
      const licenseGrowth = 12.3;

      const licensesByPeriod = this.generateLicensesByPeriod(options.period);
      const licensesByApplication = [
        {
          applicationId: 'app-1',
          applicationName: 'Advanced Analytics Pro',
          licenses: 150,
          percentage: 6.0,
        },
        {
          applicationId: 'app-2',
          applicationName: 'Data Insights Suite',
          licenses: 200,
          percentage: 8.0,
        },
        {
          applicationId: 'app-3',
          applicationName: 'Business Intelligence Tool',
          licenses: 120,
          percentage: 4.8,
        },
        {
          applicationId: 'app-4',
          applicationName: 'Other Applications',
          licenses: 2030,
          percentage: 81.2,
        },
      ];

      const licensesByStatus = [
        {
          status: 'Active',
          count: activeLicenses,
          percentage: (activeLicenses / totalLicenses) * 100,
        },
        {
          status: 'Expired',
          count: expiredLicenses,
          percentage: (expiredLicenses / totalLicenses) * 100,
        },
        {
          status: 'Suspended',
          count: suspendedLicenses,
          percentage: (suspendedLicenses / totalLicenses) * 100,
        },
      ];

      return {
        totalLicenses,
        activeLicenses,
        expiredLicenses,
        suspendedLicenses,
        licenseGrowth,
        licensesByPeriod,
        licensesByApplication,
        licensesByStatus,
      };
    } catch (error) {
      logger.error('Error getting license analytics:', error);
      throw error;
    }
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(sellerId: string, options: AnalyticsOptions): Promise<UserAnalytics> {
    try {
      // Mock data - in production, this would query the database
      const totalUsers = 1800;
      const newUsers = 150;
      const activeUsers = 1200;
      const userGrowth = 8.7;

      const usersByPeriod = this.generateUsersByPeriod(options.period);
      const usersByApplication = [
        {
          applicationId: 'app-1',
          applicationName: 'Advanced Analytics Pro',
          users: 300,
          percentage: 16.7,
        },
        {
          applicationId: 'app-2',
          applicationName: 'Data Insights Suite',
          users: 400,
          percentage: 22.2,
        },
        {
          applicationId: 'app-3',
          applicationName: 'Business Intelligence Tool',
          users: 250,
          percentage: 13.9,
        },
        {
          applicationId: 'app-4',
          applicationName: 'Other Applications',
          users: 850,
          percentage: 47.2,
        },
      ];

      const userRetention = this.generateUserRetention(options.period);

      return {
        totalUsers,
        newUsers,
        activeUsers,
        userGrowth,
        usersByPeriod,
        usersByApplication,
        userRetention,
      };
    } catch (error) {
      logger.error('Error getting user analytics:', error);
      throw error;
    }
  }

  /**
   * Get conversion analytics
   */
  async getConversionAnalytics(sellerId: string, options: AnalyticsOptions): Promise<ConversionAnalytics> {
    try {
      // Mock data - in production, this would query the database
      const totalConversions = 450;
      const conversionRate = 3.2;
      const conversionGrowth = 5.1;

      const conversionsByPeriod = this.generateConversionsByPeriod(options.period);
      const conversionsByFunnel = [
        {
          stage: 'Awareness',
          conversions: 1000,
          conversionRate: 100.0,
        },
        {
          stage: 'Interest',
          conversions: 800,
          conversionRate: 80.0,
        },
        {
          stage: 'Consideration',
          conversions: 600,
          conversionRate: 75.0,
        },
        {
          stage: 'Purchase',
          conversions: 450,
          conversionRate: 75.0,
        },
      ];

      const conversionsBySource = [
        {
          source: 'Organic Search',
          conversions: 180,
          percentage: 40.0,
        },
        {
          source: 'Direct',
          conversions: 135,
          percentage: 30.0,
        },
        {
          source: 'Social Media',
          conversions: 90,
          percentage: 20.0,
        },
        {
          source: 'Email',
          conversions: 45,
          percentage: 10.0,
        },
      ];

      return {
        totalConversions,
        conversionRate,
        conversionGrowth,
        conversionsByPeriod,
        conversionsByFunnel,
        conversionsBySource,
      };
    } catch (error) {
      logger.error('Error getting conversion analytics:', error);
      throw error;
    }
  }

  /**
   * Generate revenue by period data
   */
  private generateRevenueByPeriod(period: string): Array<{ period: string; revenue: number }> {
    const data = [];
    const now = new Date();
    let periods: number;

    switch (period) {
      case '7d':
        periods = 7;
        break;
      case '30d':
        periods = 30;
        break;
      case '90d':
        periods = 90;
        break;
      case '1y':
        periods = 365;
        break;
      default:
        periods = 30;
    }

    for (let i = periods - 1; i >= 0; i--) {
      const date = new Date(now);
      if (period === '1y') {
        date.setDate(date.getDate() - i);
        data.push({
          period: date.toISOString().split('T')[0],
          revenue: Math.floor(Math.random() * 2000) + 500,
        });
      } else {
        date.setDate(date.getDate() - i);
        data.push({
          period: date.toISOString().split('T')[0],
          revenue: Math.floor(Math.random() * 5000) + 1000,
        });
      }
    }

    return data;
  }

  /**
   * Generate licenses by period data
   */
  private generateLicensesByPeriod(period: string): Array<{ period: string; licenses: number }> {
    const data = [];
    const now = new Date();
    let periods: number;

    switch (period) {
      case '7d':
        periods = 7;
        break;
      case '30d':
        periods = 30;
        break;
      case '90d':
        periods = 90;
        break;
      case '1y':
        periods = 365;
        break;
      default:
        periods = 30;
    }

    for (let i = periods - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        period: date.toISOString().split('T')[0],
        licenses: Math.floor(Math.random() * 20) + 5,
      });
    }

    return data;
  }

  /**
   * Generate users by period data
   */
  private generateUsersByPeriod(period: string): Array<{ period: string; users: number }> {
    const data = [];
    const now = new Date();
    let periods: number;

    switch (period) {
      case '7d':
        periods = 7;
        break;
      case '30d':
        periods = 30;
        break;
      case '90d':
        periods = 90;
        break;
      case '1y':
        periods = 365;
        break;
      default:
        periods = 30;
    }

    for (let i = periods - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        period: date.toISOString().split('T')[0],
        users: Math.floor(Math.random() * 15) + 3,
      });
    }

    return data;
  }

  /**
   * Generate conversions by period data
   */
  private generateConversionsByPeriod(period: string): Array<{ period: string; conversions: number }> {
    const data = [];
    const now = new Date();
    let periods: number;

    switch (period) {
      case '7d':
        periods = 7;
        break;
      case '30d':
        periods = 30;
        break;
      case '90d':
        periods = 90;
        break;
      case '1y':
        periods = 365;
        break;
      default:
        periods = 30;
    }

    for (let i = periods - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        period: date.toISOString().split('T')[0],
        conversions: Math.floor(Math.random() * 10) + 1,
      });
    }

    return data;
  }

  /**
   * Generate user retention data
   */
  private generateUserRetention(period: string): Array<{ period: string; retentionRate: number }> {
    const data = [];
    const now = new Date();
    let periods: number;

    switch (period) {
      case '7d':
        periods = 7;
        break;
      case '30d':
        periods = 30;
        break;
      case '90d':
        periods = 90;
        break;
      case '1y':
        periods = 365;
        break;
      default:
        periods = 30;
    }

    for (let i = periods - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        period: date.toISOString().split('T')[0],
        retentionRate: Math.random() * 20 + 70, // 70-90% retention
      });
    }

    return data;
  }
}
