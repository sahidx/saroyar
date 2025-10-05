#!/bin/bash

# VPS Application Start/Restart Fix Script
# Fixes PM2 application that won't start or keeps restarting

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

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo -e "${BLUE}🔧 VPS Application Start Fix${NC}"
echo "================================================"

# Step 1: Check current status
print_status "Checking current PM2 status..."
pm2 status || echo "No PM2 processes found"

# Step 2: Kill all PM2 processes
print_status "Stopping all PM2 processes..."
pm2 kill
sleep 2

# Step 3: Force clean package.json
print_status "Fixing package.json..."
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
    "start:pm2": "pm2 start ecosystem.config.cjs",
    "stop:pm2": "pm2 stop ecosystem.config.cjs",
    "restart:pm2": "pm2 restart ecosystem.config.cjs"
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
    "bcryptjs": "^3.0.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^3.6.0",
    "dotenv": "^17.2.2",
    "drizzle-orm": "^0.39.1",
    "express": "^4.21.2",
    "express-rate-limit": "^8.0.1",
    "express-session": "^1.18.2",
    "framer-motion": "^11.13.1",
    "helmet": "^8.1.0",
    "lucide-react": "^0.453.0",
    "nanoid": "^5.1.5",
    "pg": "^8.16.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.55.0",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",
    "wouter": "^3.3.5",
    "zod": "^3.24.2"
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

print_success "Clean package.json created"

# Step 4: Validate JSON
print_status "Validating JSON..."
if node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8')); console.log('✅ Valid JSON')"; then
    print_success "JSON is valid"
else
    print_error "JSON validation failed"
    exit 1
fi

# Step 5: Clean install
print_status "Cleaning and installing dependencies..."
rm -rf node_modules package-lock.json .npm
npm cache clean --force
npm install --production=false --no-audit --no-fund

if [ $? -eq 0 ]; then
    print_success "Dependencies installed"
else
    print_error "Dependency installation failed"
    exit 1
fi

# Step 6: Check if dist directory exists and build if needed
if [ ! -f "dist/index.js" ]; then
    print_status "Building application..."
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Build completed"
    else
        print_error "Build failed"
        exit 1
    fi
else
    print_success "Built files found"
fi

# Step 7: Check environment
print_status "Checking environment..."
if [ ! -f ".env" ]; then
    print_warning "No .env file found, creating basic one..."
    cat > .env << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://saro:saro@localhost:5432/saro_db
PORT=3000
JWT_SECRET=production_jwt_secret_change_this
SESSION_SECRET=production_session_secret_change_this
EOF
    print_success "Basic .env file created"
fi

# Step 8: Test node can run the dist file
print_status "Testing if application can start..."
timeout 10s node dist/index.js &
NODE_PID=$!
sleep 5
if kill -0 $NODE_PID 2>/dev/null; then
    print_success "Application starts successfully"
    kill $NODE_PID 2>/dev/null || true
else
    print_error "Application fails to start"
    print_status "Checking for errors..."
    node dist/index.js &
    sleep 3
    kill %1 2>/dev/null || true
fi

# Step 9: Create logs directory
print_status "Creating logs directory..."
mkdir -p logs

# Step 10: Start with PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.cjs --env production

# Wait a moment
sleep 3

# Step 11: Check status
print_status "Checking PM2 status..."
pm2 status

# Step 12: Show logs if there are errors
pm2 logs --lines 20

echo ""
echo "================================================"
print_success "🎉 VPS Start Fix completed!"
echo ""
print_status "If application is still not working, check:"
echo "  1. pm2 logs coach-manager-production"
echo "  2. Check database connection: psql postgresql://saro:saro@localhost:5432/saro_db"  
echo "  3. Check if port 3000 is available: netstat -tlnp | grep 3000"
echo ""
print_status "Application should be available at:"
echo "  • http://localhost:3000"
echo "  • http://your-server-ip:3000"