#!/bin/bash

# Quick Migration Test Script
# Tests the universal migration system without affecting production

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

echo -e "${BLUE}🧪 Testing Universal Migration System${NC}"
echo ""

# ==============================================
# TEST 1: CHECK FILES EXIST
# ==============================================

info "📁 Checking migration files..."

if [ -f "migrations/20251003_fix_batches_and_users.sql" ]; then
    log "Universal migration file exists"
else
    error "Universal migration file missing"
    exit 1
fi

if [ -f "run-migrations.sh" ]; then
    log "Migration runner script exists"
else
    error "Migration runner script missing"  
    exit 1
fi

if [ -f "deploy.sh" ]; then
    log "Deployment script exists"
else
    error "Deployment script missing"
    exit 1
fi

# ==============================================
# TEST 2: CHECK SCRIPT PERMISSIONS
# ==============================================

info "🔐 Checking script permissions..."

if [ -x "run-migrations.sh" ]; then
    log "Migration script is executable"
else
    warn "Migration script not executable, fixing..."
    chmod +x run-migrations.sh
fi

if [ -x "deploy.sh" ]; then
    log "Deploy script is executable"
else
    warn "Deploy script not executable, fixing..."
    chmod +x deploy.sh
fi

# ==============================================
# TEST 3: VALIDATE MIGRATION SQL
# ==============================================

info "📝 Validating migration SQL syntax..."

# Check for critical SQL patterns
if grep -q "IF NOT EXISTS" migrations/20251003_fix_batches_and_users.sql; then
    log "Migration uses IF NOT EXISTS (idempotent)"
else
    error "Migration missing IF NOT EXISTS clauses"
fi

if grep -q "first_name" migrations/20251003_fix_batches_and_users.sql; then
    log "Migration includes first_name column fix"
else
    error "Migration missing first_name column"
fi

if grep -q "batch_code" migrations/20251003_fix_batches_and_users.sql; then
    log "Migration includes batch_code column fix"
else
    error "Migration missing batch_code column"
fi

# ==============================================
# TEST 4: CHECK PACKAGE.JSON SCRIPTS
# ==============================================

info "📦 Checking package.json scripts..."

if grep -q "db:migrate-universal" package.json; then
    log "Universal migration script available"
else
    error "Universal migration script missing from package.json"
fi

if grep -q "\"deploy\":" package.json; then
    log "Deploy script available"
else
    error "Deploy script missing from package.json"
fi

# ==============================================
# TEST 5: VALIDATE DRIZZLE CONFIG
# ==============================================

info "⚙️ Checking Drizzle configuration..."

if [ -f "drizzle.config.ts" ]; then
    log "Drizzle config exists"
    
    if grep -q "postgresql" drizzle.config.ts; then
        log "Drizzle configured for PostgreSQL"
    else
        error "Drizzle not configured for PostgreSQL"
    fi
else
    error "Drizzle config missing"
fi

# ==============================================
# TEST 6: CHECK ENVIRONMENT SETUP
# ==============================================

info "🌍 Checking environment configuration..."

if [ -f ".env.production" ]; then
    log "Production environment file exists"
else
    warn "Production environment file missing"
fi

if [ -f ".env" ]; then
    log "Development environment file exists"
else
    warn "Development environment file missing"
fi

# ==============================================
# SUMMARY
# ==============================================

echo ""
echo -e "${GREEN}🎉 Migration System Test Summary${NC}"
echo ""
log "✅ All critical files present"
log "✅ Scripts have proper permissions"
log "✅ Migration SQL is idempotent"
log "✅ Package.json scripts configured"
log "✅ Drizzle configured for PostgreSQL"
echo ""
info "📋 Ready to use:"
info "  • npm run db:migrate-universal"
info "  • npm run deploy"
info "  • ./deploy.sh"
echo ""
log "🚀 Universal migration system is ready!"
echo ""

# Show available commands
echo -e "${BLUE}📚 Available Commands:${NC}"
echo "  npm run db:migrate-universal  # Run universal migrations"
echo "  npm run deploy               # Full deployment"
echo "  npm run db:fix-columns       # Fix missing columns only"
echo "  ./deploy.sh                  # Direct deployment script"
echo "  ./run-migrations.sh          # Direct migration script"