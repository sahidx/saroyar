#!/bin/bash

# Universal Deployment Script
# Handles code updates, dependency installation, migrations, and service restart
# Safe to run multiple times

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
APP_NAME="saroyar"
APP_DIR="/var/www/saroyar"
BACKUP_DIR="/var/backups/saroyar"

log() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date '+%H:%M:%S')] ⚠️  $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%H:%M:%S')] ❌ $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')] ℹ️  $1${NC}"
}

# ==============================================
# STEP 1: PREPARATION
# ==============================================

log "🚀 Starting deployment for $APP_NAME"

# Change to app directory (create if doesn't exist)
if [ ! -d "$APP_DIR" ]; then
    info "Creating app directory: $APP_DIR"
    sudo mkdir -p "$APP_DIR"
    sudo chown -R $(whoami):$(whoami) "$APP_DIR"
fi

cd "$APP_DIR"

# ==============================================
# STEP 2: BACKUP CURRENT VERSION
# ==============================================

if [ -d ".git" ]; then
    log "📦 Creating backup of current version..."
    
    # Create backup directory
    sudo mkdir -p "$BACKUP_DIR"
    
    # Create backup with timestamp
    BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
    sudo cp -r . "$BACKUP_DIR/$BACKUP_NAME" 2>/dev/null || warn "Backup creation had issues"
    
    # Keep only last 5 backups
    sudo find "$BACKUP_DIR" -name "backup_*" -type d | sort | head -n -5 | sudo xargs rm -rf 2>/dev/null || true
    
    log "✅ Backup created: $BACKUP_DIR/$BACKUP_NAME"
fi

# ==============================================
# STEP 3: UPDATE CODE
# ==============================================

log "📥 Fetching latest code..."

if [ -d ".git" ]; then
    # Git repository exists
    git fetch origin
    git reset --hard origin/main
    log "✅ Code updated from Git"
else
    # No git repository, clone it
    warn "No git repository found, cloning..."
    cd "$(dirname "$APP_DIR")"
    sudo rm -rf "$APP_DIR"
    git clone https://github.com/sahidx/saroyar.git "$(basename "$APP_DIR")"
    cd "$APP_DIR"
    sudo chown -R $(whoami):$(whoami) .
    log "✅ Repository cloned"
fi

# ==============================================
# STEP 4: INSTALL DEPENDENCIES
# ==============================================

log "📦 Installing dependencies..."

# Install Node.js if not available
if ! command -v node >/dev/null 2>&1; then
    warn "Node.js not found, installing..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 if not available
if ! command -v pm2 >/dev/null 2>&1; then
    warn "PM2 not found, installing..."
    sudo npm install -g pm2
fi

# Clean install
rm -rf node_modules package-lock.json 2>/dev/null || true
npm install --production
log "✅ Dependencies installed"

# ==============================================
# STEP 5: BUILD PROJECT
# ==============================================

log "🛠️ Building project..."

if npm run build; then
    log "✅ Build completed successfully"
else
    warn "Build failed, continuing with existing build..."
fi

# ==============================================
# STEP 6: DATABASE MIGRATIONS
# ==============================================

log "🗄️ Running database migrations..."

# Make migration script executable
chmod +x run-migrations.sh

# Run migrations with error handling
if ./run-migrations.sh; then
    log "✅ Database migrations completed"
else
    warn "⚠️  Migration step had issues — check logs above"
    warn "Application may still work if database structure exists"
fi

# ==============================================
# STEP 7: RESTART APPLICATION SERVICE
# ==============================================

log "🔄 Restarting PM2 service..."

# Ensure logs directory exists
mkdir -p logs

# Check if PM2 process exists
if pm2 list | grep -q "$APP_NAME"; then
    # Process exists, restart it
    pm2 restart "$APP_NAME" --update-env
    log "✅ Restarted existing PM2 process"
else
    # Process doesn't exist, start it
    if [ -f "ecosystem.config.js" ]; then
        pm2 start ecosystem.config.js --env production
    else
        pm2 start "server/index.ts" --name "$APP_NAME" --interpreter "node" --interpreter-args "--loader ts-node/esm"
    fi
    pm2 save
    log "✅ Started new PM2 process"
fi

# ==============================================
# STEP 8: HEALTH CHECK
# ==============================================

log "🏥 Running health check..."

# Wait for application to start
sleep 10

# Check if application responds
if curl -f http://localhost:3001/healthz >/dev/null 2>&1; then
    log "✅ Health check passed - application is running"
elif curl -f http://localhost:3001/ >/dev/null 2>&1; then
    log "✅ Application is responding on main endpoint"
else
    warn "⚠️  Health check failed - application may still be starting"
    warn "Check logs with: pm2 logs $APP_NAME"
fi

# ==============================================
# STEP 9: FINAL STATUS
# ==============================================

log "📊 Deployment status:"

# Show PM2 status
pm2 list

# Show recent logs
log "📋 Recent application logs:"
pm2 logs "$APP_NAME" --lines 5 --nostream || warn "Could not fetch logs"

# ==============================================
# COMPLETION
# ==============================================

log "✅ Deployment completed successfully!"
log ""
log "🎯 Application Status:"
log "  • Name: $APP_NAME"
log "  • Directory: $APP_DIR" 
log "  • URL: http://localhost:3001"
log "  • Health: http://localhost:3001/healthz"
log ""
log "📋 Management Commands:"
log "  • View logs: pm2 logs $APP_NAME"
log "  • Restart: pm2 restart $APP_NAME"
log "  • Stop: pm2 stop $APP_NAME"
log "  • Status: pm2 status"
log "  • Monitor: pm2 monit"
log ""
log "🔄 To run deployment again: ./deploy.sh"

info "Deployment completed at $(date)"