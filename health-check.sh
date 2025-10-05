#!/bin/bash

# Production Health Check Script for Saroyar Application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/saroyar"
APP_URL="http://localhost:3001"

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✓ $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠ $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ✗ $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] ℹ $1${NC}"
}

# Check system services
check_services() {
    info "Checking system services..."
    
    # Check PostgreSQL
    if systemctl is-active --quiet postgresql; then
        log "PostgreSQL is running"
    else
        error "PostgreSQL is not running"
        return 1
    fi
    
    # Check Nginx
    if systemctl is-active --quiet nginx; then
        log "Nginx is running"
    else
        error "Nginx is not running"
        return 1
    fi
    
    # Check PM2
    if pgrep -f "PM2" > /dev/null; then
        log "PM2 is running"
    else
        error "PM2 is not running"
        return 1
    fi
}

# Check application
check_application() {
    info "Checking application..."
    
    # Check if PM2 app is running
    if pm2 list | grep -q "saroyar.*online"; then
        log "Saroyar application is running in PM2"
    else
        error "Saroyar application is not running in PM2"
        pm2 status
        return 1
    fi
    
    # Check if application responds
    if curl -f -s "$APP_URL/health" > /dev/null; then
        log "Application health endpoint is responding"
    else
        error "Application health endpoint is not responding"
        warn "Trying to access: $APP_URL/health"
        return 1
    fi
    
    # Check if main page loads
    if curl -f -s "$APP_URL" > /dev/null; then
        log "Application main page is accessible"
    else
        error "Application main page is not accessible"
        return 1
    fi
}

# Check database
check_database() {
    info "Checking database..."
    
    if sudo -u postgres psql -d saroyar_production -c "SELECT 1" > /dev/null 2>&1; then
        log "Database connection successful"
    else
        error "Database connection failed"
        return 1
    fi
    
    # Check if tables exist
    if sudo -u postgres psql -d saroyar_production -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'" > /dev/null 2>&1; then
        log "Database tables are accessible"
    else
        error "Database tables are not accessible"
        return 1
    fi
}

# Check disk space
check_disk_space() {
    info "Checking disk space..."
    
    # Check root partition
    USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$USAGE" -lt 80 ]; then
        log "Disk usage is healthy: ${USAGE}%"
    elif [ "$USAGE" -lt 90 ]; then
        warn "Disk usage is getting high: ${USAGE}%"
    else
        error "Disk usage is critical: ${USAGE}%"
        return 1
    fi
}

# Check memory usage
check_memory() {
    info "Checking memory usage..."
    
    # Get memory usage percentage
    MEMORY_USAGE=$(free | awk '/^Mem:/ {printf "%.0f", $3/$2*100}')
    if [ "$MEMORY_USAGE" -lt 80 ]; then
        log "Memory usage is healthy: ${MEMORY_USAGE}%"
    elif [ "$MEMORY_USAGE" -lt 90 ]; then
        warn "Memory usage is getting high: ${MEMORY_USAGE}%"
    else
        error "Memory usage is critical: ${MEMORY_USAGE}%"
        return 1
    fi
}

# Check logs for errors
check_logs() {
    info "Checking recent logs for errors..."
    
    # Check PM2 logs for errors in the last 10 lines
    if pm2 logs saroyar --lines 10 --nostream | grep -i "error\|exception\|fail" > /dev/null; then
        warn "Found errors in PM2 logs (last 10 lines)"
        info "Recent errors:"
        pm2 logs saroyar --lines 10 --nostream | grep -i "error\|exception\|fail" | tail -5
    else
        log "No recent errors found in PM2 logs"
    fi
    
    # Check Nginx error logs
    if [ -f "/var/log/nginx/error.log" ]; then
        if tail -20 /var/log/nginx/error.log | grep -i "error\|warn" > /dev/null; then
            warn "Found errors in Nginx logs (last 20 lines)"
        else
            log "No recent errors found in Nginx logs"
        fi
    fi
}

# Display system information
display_system_info() {
    info "System Information:"
    echo "  - Uptime: $(uptime -p)"
    echo "  - Load Average: $(uptime | awk -F'load average:' '{print $2}')"
    echo "  - Memory Usage: $(free -h | awk '/^Mem:/ {printf "%s/%s (%.1f%%)", $3, $2, $3/$2*100}')"
    echo "  - Disk Usage: $(df -h / | awk 'NR==2 {print $3"/"$2" ("$5")"}')"
    echo
    
    info "Application Information:"
    echo "  - PM2 Status:"
    pm2 status 2>/dev/null || echo "    PM2 not running"
    echo
    
    if [ -f "$APP_DIR/.env" ]; then
        echo "  - Environment: Production"
        echo "  - Port: $(grep '^PORT=' $APP_DIR/.env 2>/dev/null | cut -d'=' -f2 || echo '3001')"
    else
        warn "Environment file not found"
    fi
}

# Main health check
main() {
    echo "========================================"
    info "Saroyar Production Health Check"
    echo "========================================"
    echo
    
    local exit_code=0
    
    check_services || exit_code=1
    echo
    check_application || exit_code=1
    echo
    check_database || exit_code=1
    echo
    check_disk_space || exit_code=1
    echo
    check_memory || exit_code=1
    echo
    check_logs
    echo
    display_system_info
    
    echo "========================================"
    if [ $exit_code -eq 0 ]; then
        log "All health checks passed! 🎉"
        info "Your Saroyar application is running smoothly."
    else
        error "Some health checks failed! ⚠️"
        warn "Please review the errors above and fix them."
    fi
    echo "========================================"
    
    exit $exit_code
}

# Run health check
main "$@"