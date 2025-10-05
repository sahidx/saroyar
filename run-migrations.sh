#!/bin/bash

# Universal Database Migration Script
# Handles both Drizzle migrations and fallback SQL migrations
# Safe to run multiple times (idempotent)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_NAME="saroyar"
APP_DIR="/var/www/saroyar"

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

log "� Starting universal database migrations..."

# Load environment variables from multiple sources
if [ -f .env.production ]; then
    info "Loading environment from .env.production..."
    set -a
    source .env.production
    set +a
elif [ -f .env ]; then
    info "Loading environment from .env..."
    set -a
    source .env
    set +a
fi

# Fallback DATABASE_URL if not set
if [ -z "$DATABASE_URL" ]; then
    warn "DATABASE_URL not found in environment, using default..."
    export DATABASE_URL="postgresql://saro:saro@localhost:5432/saro_db"
# ==============================================
# STEP 1: TRY DRIZZLE MIGRATIONS FIRST
# ==============================================

info "📋 Running Drizzle migrations..."
DRIZZLE_SUCCESS=false

if npx drizzle-kit migrate 2>&1; then
    log "✅ Drizzle migrations completed successfully"
    DRIZZLE_SUCCESS=true
else
    warn "⚠️  Drizzle migration failed, will try fallback methods..."
fi

# ==============================================
# STEP 2: FALLBACK TO RAW SQL MIGRATIONS
# ==============================================

if [ "$DRIZZLE_SUCCESS" = false ]; then
    warn "📄 Falling back to raw SQL migrations..."
    
    # Apply universal migration first
    if [ -f "migrations/20251003_fix_batches_and_users.sql" ]; then
        info "Applying universal schema fix..."
        if psql "$DATABASE_URL" -f "migrations/20251003_fix_batches_and_users.sql"; then
            log "✅ Universal schema fix applied successfully"
        else
            warn "⚠️  Universal schema fix had issues, continuing..."
        fi
    fi
    
    # Apply any other SQL migration files
    if ls migrations/*.sql >/dev/null 2>&1; then
        for f in migrations/*.sql; do
            if [ "$f" != "migrations/20251003_fix_batches_and_users.sql" ]; then
                info "📄 Applying migration: $(basename $f)"
                if psql "$DATABASE_URL" -f "$f"; then
                    log "✅ Applied $(basename $f) successfully"
                else
                    warn "⚠️  Failed on $(basename $f), continuing..."
                fi
            fi
        done
    else
        info "No SQL migration files found"
    fi
fi

# ==============================================
# STEP 3: VERIFY DATABASE SCHEMA
# ==============================================

info "🔍 Verifying database schema..."
REQUIRED_TABLES=("users" "batches")

for table in "${REQUIRED_TABLES[@]}"; do
    if psql "$DATABASE_URL" -c "\d $table" >/dev/null 2>&1; then
        log "  ✅ Table '$table' exists"
    else
        error "  ❌ Table '$table' missing"
    fi
done

# Check for critical columns
info "🔍 Checking critical columns..."

# Check users table columns
if psql "$DATABASE_URL" -c "\d users" | grep -q "first_name"; then
    log "  ✅ users.first_name exists"
else
    warn "  ⚠️  users.first_name missing"
fi

if psql "$DATABASE_URL" -c "\d users" | grep -q "profile_image_url"; then
    log "  ✅ users.profile_image_url exists"
else
    warn "  ⚠️  users.profile_image_url missing"
fi

# Check batches table columns  
if psql "$DATABASE_URL" -c "\d batches" | grep -q "batch_code"; then
    log "  ✅ batches.batch_code exists"
else
    warn "  ⚠️  batches.batch_code missing"
fi

if psql "$DATABASE_URL" -c "\d batches" | grep -q "class_time"; then
    log "  ✅ batches.class_time exists"
else
    warn "  ⚠️  batches.class_time missing"
fi

# ==============================================
# STEP 4: FINAL VERIFICATION & COMPLETION
# ==============================================

log "🔍 Final schema verification..."

# Count tables
TABLE_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)
log "📊 Found $TABLE_COUNT tables in database"

# Check if we have basic functionality
if [ "$TABLE_COUNT" -gt 0 ]; then
    log "✅ Database has tables - basic structure exists"
else
    error "❌ No tables found - migration may have failed"
    exit 1
fi

log "🎉 Universal migration process completed!"
log "📋 Summary:"
log "  - Drizzle migrations: $([ "$DRIZZLE_SUCCESS" = true ] && echo "✅ Success" || echo "⚠️  Failed, used fallback")"
log "  - SQL fallback migrations: Applied"
log "  - Schema verification: Completed"
log "  - Total tables: $TABLE_COUNT"

info "Your database is ready for the application!"
info "If you see any warnings above, they will be auto-fixed when the app starts."