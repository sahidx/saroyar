#!/bin/bash

# Production Deployment Script for Coach Manager System
# This script handles proper dependency installation and building for production

set -e  # Exit on any error

echo "🚀 Starting production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Step 1: Clean previous builds
print_status "Cleaning previous builds..."
rm -rf dist node_modules/.cache client/dist server/public 2>/dev/null || true

# Step 2: Install all dependencies (including dev dependencies for build process)
print_status "Installing all dependencies (including dev dependencies for build)..."
npm install --production=false

if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi

print_success "Dependencies installed successfully"

# Step 3: Build the application
print_status "Building the application..."

# Build frontend first
print_status "Building frontend..."
npm run build:frontend

if [ $? -ne 0 ]; then
    print_error "Frontend build failed"
    exit 1
fi

print_success "Frontend built successfully"

# Build backend
print_status "Building backend..."
npm run build:backend

if [ $? -ne 0 ]; then
    print_error "Backend build failed"
    exit 1
fi

print_success "Backend built successfully"

# Step 4: Check if build files exist
print_status "Verifying build output..."

if [ ! -d "server/public" ]; then
    print_error "Frontend build output not found in server/public"
    exit 1
fi

if [ ! -f "dist/index.js" ]; then
    print_error "Backend build output not found in dist/index.js"
    exit 1
fi

print_success "Build verification completed"

# Step 5: Install production dependencies only (optional for production server)
print_status "Preparing production node_modules..."
npm prune --production

print_success "Production dependencies prepared"

# Step 6: Display build information
print_status "Build Information:"
echo "  Frontend bundle size: $(du -h server/public/assets/*.js | cut -f1 | head -n1)"
echo "  Backend bundle size: $(du -h dist/index.js | cut -f1)"
echo "  Total build size: $(du -sh dist server/public | awk '{sum+=$1} END {print sum "K"}')"

print_success "🎉 Production build completed successfully!"
print_status "📋 Next steps:"
echo "  1. Copy files to your VPS"
echo "  2. Set up environment variables (.env)"
echo "  3. Run 'npm run start:pm2' to start with PM2"
echo "  4. Configure nginx reverse proxy if needed"

print_warning "📝 Note: Make sure PostgreSQL is running and configured on your production server"