# LicenseChain Seller API

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-blue.svg)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.5+-blue.svg)](https://www.typescriptlang.org/)

Official Seller API for LicenseChain - RESTful API for license management and seller operations.

## 🚀 Features

- **🔐 Authentication** - JWT-based authentication and authorization
- **📜 License Management** - Create, validate, update, and revoke licenses
- **👤 User Management** - User registration, login, and profile management
- **📊 Analytics** - Comprehensive analytics and reporting
- **🔔 Webhooks** - Real-time event notifications
- **💳 Payment Integration** - Stripe and PayPal payment processing
- **🛡️ Security** - Rate limiting, CORS, and input validation
- **📚 Documentation** - OpenAPI/Swagger documentation

## 📦 Installation

### Method 1: npm (Recommended)

```bash
# Clone the repository
git clone https://github.com/LicenseChain/LicenseChain-Seller-API.git
cd LicenseChain-Seller-API

# Install dependencies
npm install

# Start the API
npm start
```

### Method 2: Docker

```bash
# Build the Docker image
docker build -t licensechain-seller-api .

# Run the container
docker run -p 3000:3000 licensechain-seller-api
```

### Method 3: Manual Installation

1. Download the latest release from [GitHub Releases](https://github.com/LicenseChain/LicenseChain-Seller-API/releases)
2. Extract to your project directory
3. Install dependencies: `npm install`
4. Configure environment variables
5. Start the API: `npm start`

## 🚀 Quick Start

### Basic Setup

```bash
# Clone the repository
git clone https://github.com/LicenseChain/LicenseChain-Seller-API.git
cd LicenseChain-Seller-API

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env

# Start the API
npm start
```

### Environment Configuration

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
HOST=localhost

# Database Configuration
DATABASE_URL=your-database-url
REDIS_URL=your-redis-url

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h

# LicenseChain Configuration
LICENSECHAIN_API_KEY=your-api-key
LICENSECHAIN_APP_NAME=your-app-name
LICENSECHAIN_APP_VERSION=1.0.0

# Payment Configuration
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

## 📚 API Reference

### Authentication Endpoints

```http
# Register a new user
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string"
}

# Login user
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}

# Refresh token
POST /api/auth/refresh
Authorization: Bearer <token>

# Logout user
POST /api/auth/logout
Authorization: Bearer <token>
```

### License Endpoints

```http
# Get all licenses
GET /api/licenses
Authorization: Bearer <token>

# Get license by ID
GET /api/licenses/:id
Authorization: Bearer <token>

# Create a new license
POST /api/licenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "string",
  "features": ["string"],
  "expires": "string",
  "type": "string"
}

# Update a license
PUT /api/licenses/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "string",
  "features": ["string"],
  "expires": "string"
}

# Delete a license
DELETE /api/licenses/:id
Authorization: Bearer <token>
```

### User Endpoints

```http
# Get all users
GET /api/users
Authorization: Bearer <token>

# Get user by ID
GET /api/users/:id
Authorization: Bearer <token>

# Update user
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "string",
  "lastName": "string",
  "email": "string"
}

# Delete user
DELETE /api/users/:id
Authorization: Bearer <token>
```

### Analytics Endpoints

```http
# Get usage analytics
GET /api/analytics/usage
Authorization: Bearer <token>
Query Parameters:
  - startDate: string
  - endDate: string
  - groupBy: string

# Get license analytics
GET /api/analytics/licenses
Authorization: Bearer <token>
Query Parameters:
  - startDate: string
  - endDate: string
  - status: string

# Get revenue analytics
GET /api/analytics/revenue
Authorization: Bearer <token>
Query Parameters:
  - startDate: string
  - endDate: string
  - currency: string
```

### Webhook Endpoints

```http
# Create webhook
POST /api/webhooks
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "string",
  "events": ["string"],
  "secret": "string"
}

# Get webhooks
GET /api/webhooks
Authorization: Bearer <token>

# Update webhook
PUT /api/webhooks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "string",
  "events": ["string"],
  "active": boolean
}

# Delete webhook
DELETE /api/webhooks/:id
Authorization: Bearer <token>
```

## 🔧 Configuration

### Application Settings

Configure the application through environment variables or a configuration file:

```typescript
// config/index.ts
export default {
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    env: process.env.NODE_ENV || 'development'
  },
  database: {
    url: process.env.DATABASE_URL,
    redis: process.env.REDIS_URL
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  licensechain: {
    apiKey: process.env.LICENSECHAIN_API_KEY,
    appName: process.env.LICENSECHAIN_APP_NAME,
    version: process.env.LICENSECHAIN_APP_VERSION
  },
  payments: {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
    },
    paypal: {
      clientId: process.env.PAYPAL_CLIENT_ID,
      clientSecret: process.env.PAYPAL_CLIENT_SECRET
    }
  }
};
```

### Database Configuration

The API supports multiple database types:

```typescript
// PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/licensechain

// MySQL
DATABASE_URL=mysql://username:password@localhost:3306/licensechain

// MongoDB
DATABASE_URL=mongodb://localhost:27017/licensechain
```

### Redis Configuration

Configure Redis for caching and session storage:

```typescript
// config/redis.ts
export default {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0')
};
```

## 🛡️ Security Features

### Authentication

- JWT token-based authentication
- Refresh token rotation
- Password hashing with bcrypt
- Account lockout after failed attempts

### Authorization

- Role-based access control
- Route-level permissions
- API key authentication
- OAuth2 integration

### Data Protection

- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting

## 📊 Analytics and Monitoring

### Request Analytics

```typescript
// Track API requests
app.use((req, res, next) => {
  analytics.track('api_request', {
    method: req.method,
    path: req.path,
    user: req.user?.id,
    timestamp: new Date()
  });
  next();
});
```

### Performance Monitoring

```typescript
// Monitor response times
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    metrics.record('response_time', duration);
  });
  next();
});
```

### Error Tracking

```typescript
// Track API errors
app.use((err, req, res, next) => {
  errorTracker.captureException(err, {
    user: req.user?.id,
    path: req.path,
    method: req.method
  });
  next(err);
});
```

## 🔄 Error Handling

### Custom Error Types

```typescript
// Custom error classes
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = 403;
  }
}
```

### Error Middleware

```typescript
// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = (err as any).statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString()
    }
  });
});
```

## 🧪 Testing

### Unit Tests

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Integration Tests

```bash
# Test with real database
npm run test:integration
```

### End-to-End Tests

```bash
# Test complete API flows
npm run test:e2e
```

## 📝 Examples

See the `examples/` directory for complete examples:

- `basic-setup.js` - Basic API setup
- `authentication.js` - Authentication examples
- `license-management.js` - License management examples
- `webhook-integration.js` - Webhook handling

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Clone the repository
2. Install Node.js 16 or later
3. Install dependencies: `npm install`
4. Set up environment variables
5. Start development server: `npm run dev`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [https://docs.licensechain.app/seller-api](https://docs.licensechain.app/seller-api)
- **Issues**: [GitHub Issues](https://github.com/LicenseChain/LicenseChain-Seller-API/issues)
- **Discord**: [LicenseChain Discord](https://discord.gg/licensechain)
- **Email**: support@licensechain.app

## 🔗 Related Projects

- [LicenseChain Node.js SDK](https://github.com/LicenseChain/LicenseChain-NodeJS-SDK)
- [LicenseChain Customer Panel](https://github.com/LicenseChain/LicenseChain-Customer-Panel)
- [LicenseChain Discord Bot](https://github.com/LicenseChain/LicenseChain-Discord-Bot)

---

**Made with ❤️ for the LicenseChain community**
