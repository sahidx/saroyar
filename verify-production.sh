#!/bin/bash

# Production Verification Script
# Run this after deployment to verify everything is working

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}✅ $1${NC}"
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo -e "${BLUE}🔍 Running Production Verification...${NC}"
echo ""

# Check if PM2 is running
info "Checking PM2 status..."
if pm2 list | grep -q "saroyar"; then
    log "PM2 process is running"
else
    error "PM2 process not found"
    exit 1
fi

# Check database connection
info "Testing database connection..."
if PGPASSWORD="${DB_PASSWORD:-saro_secure_2024}" psql -h localhost -U saro -d saro_db -c "SELECT 1;" > /dev/null 2>&1; then
    log "Database connection successful"
else
    error "Database connection failed"
    exit 1
fi

# Check application health endpoint
info "Testing application health..."
sleep 5  # Give app time to start
if curl -f http://localhost:3001/healthz > /dev/null 2>&1; then
    log "Application health check passed"
else
    warn "Application health check failed - app might still be starting"
fi

# Check if port 3001 is listening
info "Checking if application port is listening..."
if netstat -tln | grep -q ":3001"; then
    log "Application is listening on port 3001"
else
    error "Application is not listening on port 3001"
fi

# Check Nginx status
info "Checking Nginx status..."
if systemctl is-active --quiet nginx; then
    log "Nginx is running"
else
    warn "Nginx is not running"
fi

# Check PostgreSQL status
info "Checking PostgreSQL status..."
if systemctl is-active --quiet postgresql; then
    log "PostgreSQL is running"
else
    error "PostgreSQL is not running"
fi

# Check disk space
info "Checking disk space..."
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    log "Disk space is adequate ($DISK_USAGE% used)"
else
    warn "Disk space is getting low ($DISK_USAGE% used)"
fi

# Check memory usage
info "Checking memory usage..."
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.1f", $3*100/$2}')
log "Memory usage: ${MEMORY_USAGE}%"

# Check if logs directory exists
info "Checking logs directory..."
if [ -d "./logs" ]; then
    log "Logs directory exists"
else
    warn "Logs directory not found"
fi

# Check if uploads directory exists
info "Checking uploads directory..."
if [ -d "./uploads" ]; then
    log "Uploads directory exists"
else
    warn "Uploads directory not found"
fi

# Show PM2 status
echo ""
info "PM2 Status:"
pm2 status

# Show recent logs
echo ""
info "Recent application logs:"
pm2 logs saroyar --lines 10 --nostream

echo ""
echo -e "${GREEN}🎉 Production verification completed!${NC}"
echo ""
echo -e "${BLUE}Application URL: http://localhost:3001${NC}"
echo -e "${BLUE}Health Check: http://localhost:3001/health${NC}"
echo -e "${BLUE}PM2 Monitoring: pm2 monit${NC}"
echo ""