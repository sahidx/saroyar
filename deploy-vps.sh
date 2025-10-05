#!/bin/bash
# VPS Deployment Script for CoachManager Production
# Run this script on your VPS after uploading the code

set -e  # Exit on any error

echo "🚀 Starting CoachManager Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}❌ Please do not run this script as root${NC}"
    exit 1
fi

# Function to check command availability
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 is not installed${NC}"
        return 1
    fi
    echo -e "${GREEN}✅ $1 is available${NC}"
    return 0
}

# Function to check environment variables
check_env() {
    if [ -z "${!1}" ]; then
        echo -e "${RED}❌ Environment variable $1 is not set${NC}"
        return 1
    fi
    echo -e "${GREEN}✅ $1 is set${NC}"
    return 0
}

echo -e "${BLUE}📋 Step 1: Checking system requirements...${NC}"

# Check required commands
check_command "node" || exit 1
check_command "npm" || exit 1
check_command "psql" || exit 1
check_command "pm2" || { echo -e "${YELLOW}Installing PM2...${NC}"; npm install -g pm2; }

echo -e "${BLUE}📋 Step 2: Checking environment variables...${NC}"

# Load environment variables
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo -e "${GREEN}✅ Environment variables loaded from .env${NC}"
else
    echo -e "${RED}❌ .env file not found. Please create it first.${NC}"
    exit 1
fi

# Check required environment variables
check_env "DATABASE_URL" || exit 1
check_env "SESSION_SECRET" || exit 1

echo -e "${BLUE}📋 Step 3: Testing database connection...${NC}"

# Test PostgreSQL connection
if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL connection successful${NC}"
else
    echo -e "${RED}❌ Cannot connect to PostgreSQL. Please check your DATABASE_URL${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Step 4: Installing dependencies...${NC}"

# Install production dependencies
npm ci --only=production --silent
echo -e "${GREEN}✅ Dependencies installed${NC}"

echo -e "${BLUE}📋 Step 5: Running database migrations...${NC}"

# Run database migrations
npm run db:migrate
echo -e "${GREEN}✅ Database migrations completed${NC}"

echo -e "${BLUE}📋 Step 6: Building application...${NC}"

# Build the application
npm run build
echo -e "${GREEN}✅ Application built successfully${NC}"

echo -e "${BLUE}📋 Step 7: Setting up PM2...${NC}"

# Stop any existing PM2 processes
pm2 delete coachmanager-backend 2>/dev/null || true

# Start the application with PM2
pm2 start ecosystem.config.cjs --env production
pm2 save
echo -e "${GREEN}✅ Application started with PM2${NC}"

echo -e "${BLUE}📋 Step 8: Setting up PM2 startup...${NC}"

# Setup PM2 to start on boot
pm2 startup | tail -1 | bash
echo -e "${GREEN}✅ PM2 startup configured${NC}"

echo -e "${BLUE}📋 Step 9: Final verification...${NC}"

# Wait a moment for the app to start
sleep 5

# Check if the application is running
if pm2 list | grep -q "coachmanager-backend.*online"; then
    echo -e "${GREEN}✅ Application is running successfully${NC}"
    
    # Get the application URL
    APP_PORT=$(grep "PORT=" .env | cut -d '=' -f2 | tr -d '"')
    APP_URL="http://localhost:${APP_PORT:-3001}"
    
    echo -e "${GREEN}"
    echo "🎉 CoachManager Production Deployment Completed Successfully!"
    echo ""
    echo "� Application Status:"
    pm2 list
    echo ""
    echo "🌐 Application URL: $APP_URL"
    echo "📋 PM2 Status: pm2 status"
    echo "📋 Application Logs: pm2 logs coachmanager-backend"
    echo "� Restart Application: pm2 restart coachmanager-backend"
    echo ""
    echo "� Next Steps:"
    echo "1. Configure Nginx reverse proxy (optional)"
    echo "2. Set up SSL certificate with Let's Encrypt (recommended)"
    echo "3. Create your first admin user through the web interface"
    echo "4. Configure firewall to allow HTTP/HTTPS traffic"
    echo -e "${NC}"
    
else
    echo -e "${RED}❌ Application failed to start. Check logs with: pm2 logs${NC}"
    pm2 logs coachmanager-backend --lines 50
    exit 1
fi