#!/bin/bash

# LicenseChain Seller API Deployment Script
# This script builds and deploys the Seller API

set -e

echo "🚀 Starting LicenseChain Seller API deployment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run tests
echo "🧪 Running tests..."
npm test

# Build the application
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed. dist directory not found."
    exit 1
fi

echo "✅ Build completed successfully"

# Create logs directory
mkdir -p logs

# Set permissions
chmod +x dist/index.js

echo "🎉 LicenseChain Seller API deployment completed successfully!"
echo ""
echo "To start the application:"
echo "  npm start"
echo ""
echo "To start with Docker:"
echo "  docker-compose up -d"
echo ""
echo "API will be available at: http://localhost:3002"
echo "Health check: http://localhost:3002/health"
