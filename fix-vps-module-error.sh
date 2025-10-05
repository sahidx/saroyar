#!/bin/bash

# VPS Module Error Fix Script
# Fixes ERR_MODULE_NOT_FOUND issues

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo -e "${BLUE}🔧 VPS Module Error Fix${NC}"
echo "======================================"

print_status "Stopping PM2 processes..."
pm2 stop all 2>/dev/null || true

print_status "Checking current issue..."
echo "Current error: ERR_MODULE_NOT_FOUND"
echo "This means the built dist/index.js has import issues"

print_status "Checking if we need to rebuild..."
if [ ! -f "dist/index.js" ]; then
    print_error "dist/index.js missing - need full rebuild"
    NEED_REBUILD=true
else
    print_status "dist/index.js exists, checking dependencies..."
    NEED_REBUILD=false
fi

# Create complete package.json with ALL dependencies needed
print_status "Creating complete package.json..."
cat > package.json << 'EOF'
{
  "name": "rest-express",
  "version": "1.0.0",
  "type": "module",
  "license": "MIT",
  "scripts": {
    "dev": "cross-env NODE_ENV=development tsx server/index.ts",
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "vite build",
    "build:backend": "esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --minify --resolve-extensions=.ts,.js --alias:@shared=shared",
    "start": "cross-env NODE_ENV=production node dist/index.js",
    "start:pm2": "pm2 start ecosystem.config.cjs"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^4.3.2",
    "autoprefixer": "^10.4.20",
    "cross-env": "^10.0.0",
    "esbuild": "^0.25.0",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.17",
    "tsx": "^4.19.1",
    "typescript": "5.6.3",
    "vite": "^5.4.19",
    "express": "^4.21.2",
    "express-rate-limit": "^8.0.1",
    "express-session": "^1.18.2",
    "helmet": "^8.1.0",
    "dotenv": "^17.2.2",
    "drizzle-orm": "^0.39.1",
    "pg": "^8.16.3",
    "bcryptjs": "^3.0.2",
    "nanoid": "^5.1.5",
    "zod": "^3.24.2",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@radix-ui/react-accordion": "^1.2.4",
    "@radix-ui/react-alert-dialog": "^1.1.7",
    "@radix-ui/react-avatar": "^1.1.4",
    "@radix-ui/react-checkbox": "^1.1.5",
    "@radix-ui/react-dialog": "^1.1.7",
    "@radix-ui/react-dropdown-menu": "^2.1.7",
    "@radix-ui/react-label": "^2.1.3",
    "@radix-ui/react-popover": "^1.1.7",
    "@radix-ui/react-select": "^2.1.7",
    "@radix-ui/react-separator": "^1.1.3",
    "@radix-ui/react-slot": "^1.2.0",
    "@radix-ui/react-switch": "^1.1.4",
    "@radix-ui/react-tabs": "^1.1.4",
    "@radix-ui/react-toast": "^1.2.7",
    "@tanstack/react-query": "^5.60.5",
    "axios": "^1.12.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^3.6.0",
    "framer-motion": "^11.13.1",
    "lucide-react": "^0.453.0",
    "react-hook-form": "^7.55.0",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",
    "wouter": "^3.3.5"
  },
  "devDependencies": {
    "@types/express": "4.17.21",
    "@types/node": "20.16.11",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "drizzle-kit": "^0.31.4"
  }
}
EOF

print_success "Complete package.json created"

# Clean install
print_status "Clean installing dependencies..."
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --production=false

if [ $? -eq 0 ]; then
    print_success "All dependencies installed"
else
    print_error "Dependency installation failed"
    exit 1
fi

# Always rebuild to fix module issues
print_status "Rebuilding application..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

# Verify build output
print_status "Verifying build output..."
if [ -f "dist/index.js" ]; then
    BUILD_SIZE=$(du -h dist/index.js | cut -f1)
    print_success "Backend built: $BUILD_SIZE"
else
    print_error "Backend build missing"
    exit 1
fi

if [ -f "server/public/index.html" ]; then
    print_success "Frontend built successfully"
else
    print_error "Frontend build missing"
    exit 1
fi

# Test the built application
print_status "Testing built application..."
timeout 10s node dist/index.js &
NODE_PID=$!
sleep 3

if kill -0 $NODE_PID 2>/dev/null; then
    print_success "Application starts without module errors"
    kill $NODE_PID 2>/dev/null || true
else
    print_error "Application still has module issues"
    print_status "Checking error..."
    node dist/index.js 2>&1 | head -20
fi

# Create/update environment
print_status "Setting up environment..."
if [ ! -f ".env" ]; then
    cat > .env << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://saro:saro@localhost:5432/saro_db
PORT=3000
JWT_SECRET=production_jwt_secret_change_this
SESSION_SECRET=production_session_secret_change_this
EOF
    print_success ".env created"
fi

# Start with PM2
print_status "Starting with PM2..."
mkdir -p logs
pm2 start ecosystem.config.cjs --env production

# Wait and check
sleep 5
pm2 status

print_status "Checking for errors..."
pm2 logs --lines 20

echo ""
echo "======================================"
print_success "🎉 Module fix completed!"
echo ""
print_status "If still showing errors:"
echo "  1. Check: pm2 logs coach-manager-production"
echo "  2. Test direct: node dist/index.js"
echo "  3. Check build: ls -la dist/"
echo ""
print_status "Application URLs:"
echo "  • http://localhost:3000"
echo "  • http://your-server-ip:3000"