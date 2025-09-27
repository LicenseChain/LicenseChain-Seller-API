import { Request, Response, NextFunction } from 'express';

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export class ValidationError extends Error {
  public errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateLicenseKey = (licenseKey: string): boolean => {
  if (!licenseKey || typeof licenseKey !== 'string') {
    return false;
  }
  
  // License key should be 32 characters long and contain only alphanumeric characters
  return licenseKey.length === 32 && /^[A-Z0-9]+$/.test(licenseKey);
};

export const validateUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const validateAmount = (amount: any): boolean => {
  const numAmount = Number(amount);
  return !isNaN(numAmount) && numAmount > 0;
};

export const validateCurrency = (currency: string): boolean => {
  const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY'];
  return validCurrencies.includes(currency.toUpperCase());
};

export const validateStatus = (status: string, validStatuses: string[]): boolean => {
  return validStatuses.includes(status);
};

export const validatePagination = (page: any, limit: any): { page: number; limit: number } => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
  
  return { page: pageNum, limit: limitNum };
};

export const validateDateRange = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return false;
  }
  
  return start <= end;
};

export const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>\"'&]/g, (match) => {
      const escapeMap: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return escapeMap[match];
    });
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
};

// Validation middleware
export const validateCreateLicense = (req: Request, res: Response, next: NextFunction): void => {
  const errors: ValidationError[] = [];
  const { userId, productId, metadata, expiresAt } = req.body;

  if (!userId || typeof userId !== 'string') {
    errors.push({ field: 'userId', message: 'User ID is required and must be a string' });
  }

  if (!productId || typeof productId !== 'string') {
    errors.push({ field: 'productId', message: 'Product ID is required and must be a string' });
  }

  if (metadata && typeof metadata !== 'object') {
    errors.push({ field: 'metadata', message: 'Metadata must be an object' });
  }

  if (expiresAt && (typeof expiresAt !== 'string' || isNaN(new Date(expiresAt).getTime()))) {
    errors.push({ field: 'expiresAt', message: 'Expires at must be a valid date string' });
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
    return;
  }

  // Sanitize inputs
  req.body = sanitizeInput(req.body);
  next();
};

export const validateUpdateLicense = (req: Request, res: Response, next: NextFunction): void => {
  const errors: ValidationError[] = [];
  const { status, metadata, expiresAt } = req.body;

  if (status && !['active', 'inactive', 'expired', 'suspended', 'revoked'].includes(status)) {
    errors.push({ field: 'status', message: 'Status must be one of: active, inactive, expired, suspended, revoked' });
  }

  if (metadata && typeof metadata !== 'object') {
    errors.push({ field: 'metadata', message: 'Metadata must be an object' });
  }

  if (expiresAt && (typeof expiresAt !== 'string' || isNaN(new Date(expiresAt).getTime()))) {
    errors.push({ field: 'expiresAt', message: 'Expires at must be a valid date string' });
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
    return;
  }

  // Sanitize inputs
  req.body = sanitizeInput(req.body);
  next();
};

export const validateCreatePayment = (req: Request, res: Response, next: NextFunction): void => {
  const errors: ValidationError[] = [];
  const { licenseId, amount, currency, paymentMethod, metadata } = req.body;

  if (!licenseId || typeof licenseId !== 'string') {
    errors.push({ field: 'licenseId', message: 'License ID is required and must be a string' });
  }

  if (!amount || !validateAmount(amount)) {
    errors.push({ field: 'amount', message: 'Amount is required and must be a positive number' });
  }

  if (!currency || !validateCurrency(currency)) {
    errors.push({ field: 'currency', message: 'Currency is required and must be a valid currency code' });
  }

  if (!paymentMethod || typeof paymentMethod !== 'string') {
    errors.push({ field: 'paymentMethod', message: 'Payment method is required and must be a string' });
  }

  if (metadata && typeof metadata !== 'object') {
    errors.push({ field: 'metadata', message: 'Metadata must be an object' });
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
    return;
  }

  // Sanitize inputs
  req.body = sanitizeInput(req.body);
  next();
};

export const validateUpdatePayment = (req: Request, res: Response, next: NextFunction): void => {
  const errors: ValidationError[] = [];
  const { status, metadata } = req.body;

  if (status && !['pending', 'completed', 'failed', 'cancelled', 'refunded'].includes(status)) {
    errors.push({ field: 'status', message: 'Status must be one of: pending, completed, failed, cancelled, refunded' });
  }

  if (metadata && typeof metadata !== 'object') {
    errors.push({ field: 'metadata', message: 'Metadata must be an object' });
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
    return;
  }

  // Sanitize inputs
  req.body = sanitizeInput(req.body);
  next();
};

export const validateProcessRefund = (req: Request, res: Response, next: NextFunction): void => {
  const errors: ValidationError[] = [];
  const { amount, reason } = req.body;

  if (!amount || !validateAmount(amount)) {
    errors.push({ field: 'amount', message: 'Amount is required and must be a positive number' });
  }

  if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
    errors.push({ field: 'reason', message: 'Reason is required and must be a non-empty string' });
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
    return;
  }

  // Sanitize inputs
  req.body = sanitizeInput(req.body);
  next();
};

export const validateExtendLicense = (req: Request, res: Response, next: NextFunction): void => {
  const errors: ValidationError[] = [];
  const { days } = req.body;

  if (!days || !Number.isInteger(Number(days)) || Number(days) <= 0) {
    errors.push({ field: 'days', message: 'Days is required and must be a positive integer' });
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
    return;
  }

  // Sanitize inputs
  req.body = sanitizeInput(req.body);
  next();
};

export const validatePaginationQuery = (req: Request, res: Response, next: NextFunction): void => {
  const { page, limit } = req.query;
  
  const { page: validPage, limit: validLimit } = validatePagination(page, limit);
  
  req.query.page = validPage.toString();
  req.query.limit = validLimit.toString();
  
  next();
};

export const validateDateRangeQuery = (req: Request, res: Response, next: NextFunction): void => {
  const { startDate, endDate } = req.query;
  
  if (startDate && endDate) {
    if (!validateDateRange(startDate as string, endDate as string)) {
      res.status(400).json({
        success: false,
        error: 'Invalid date range: start date must be before or equal to end date'
      });
      return;
    }
  }
  
  next();
};

export const validateUUIDParam = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const paramValue = req.params[paramName];
    
    if (!paramValue || !validateUUID(paramValue)) {
      res.status(400).json({
        success: false,
        error: `Invalid ${paramName}: must be a valid UUID`
      });
      return;
    }
    
    next();
  };
};

export const validateLicenseKeyParam = (req: Request, res: Response, next: NextFunction): void => {
  const { licenseKey } = req.body;
  
  if (!licenseKey || !validateLicenseKey(licenseKey)) {
    res.status(400).json({
      success: false,
      error: 'Invalid license key format'
    });
    return;
  }
  
  next();
};
