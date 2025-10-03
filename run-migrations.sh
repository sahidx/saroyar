#!/bin/bash

# Database Migration Script with Proper Environment Handling
# This script ensures migrations run with the correct DATABASE_URL

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🔄 Starting database migrations..."

# Load environment variables from multiple sources
if [ -f .env ]; then
    echo "📋 Loading environment from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
fi

# Source bashrc if available
if [ -f ~/.bashrc ]; then
    source ~/.bashrc 2>/dev/null || true
fi

# Validate DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ ERROR: DATABASE_URL is not set${NC}"
    echo ""
    echo "Solutions:"
    echo "1. Run: ./setup-vps-environment.sh"
    echo "2. Or manually set: export DATABASE_URL='postgresql://user:pass@host:5432/db'"
    echo "3. Or add to .env file"
    exit 1
fi

# Mask password for logging
MASKED_URL=$(echo "$DATABASE_URL" | sed 's/:\/\/[^:]*:[^@]*@/:\/\/***:***@/')
echo -e "${GREEN}✅ Using DATABASE_URL: $MASKED_URL${NC}"

# Test database connection first
echo "🔍 Testing database connection..."
if command -v psql >/dev/null 2>&1; then
    if ! psql "$DATABASE_URL" -c "SELECT 1;" >/dev/null 2>&1; then
        echo -e "${RED}❌ Database connection failed${NC}"
        echo "Please check your DATABASE_URL and ensure PostgreSQL is running"
        exit 1
    fi
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${YELLOW}⚠️  psql not available, skipping connection test${NC}"
fi

# Ensure drizzle-kit is available
if ! command -v npx >/dev/null 2>&1; then
    echo -e "${RED}❌ npx not found${NC}"
    exit 1
fi

# Run migrations with explicit environment
echo "📋 Running Drizzle migrations..."
export DATABASE_URL="$DATABASE_URL"

if npx drizzle-kit migrate --config=drizzle.config.ts 2>&1; then
    echo -e "${GREEN}✅ Migrations completed successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Standard migration failed, trying push...${NC}"
    
    if npx drizzle-kit push --config=drizzle.config.ts --force 2>&1; then
        echo -e "${GREEN}✅ Schema push completed successfully${NC}"
    else
        echo -e "${RED}❌ Both migration and push failed${NC}"
        
        # Try introspect to see what's in the database
        echo "🔍 Checking database schema..."
        npx drizzle-kit introspect --config=drizzle.config.ts || true
        
        exit 1
    fi
fi

# Verify essential tables exist
echo "🔍 Verifying database schema..."
REQUIRED_TABLES=("users" "batches" "exams" "attendance" "messages" "notices")

for table in "${REQUIRED_TABLES[@]}"; do
    if psql "$DATABASE_URL" -c "\d $table" >/dev/null 2>&1; then
        echo -e "${GREEN}  ✅ Table '$table' exists${NC}"
    else
        echo -e "${RED}  ❌ Table '$table' missing${NC}"
    fi
done

# Check for proper column names (snake_case in DB)
echo "🔍 Verifying column naming convention..."
if psql "$DATABASE_URL" -c "\d users" 2>/dev/null | grep -q "first_name"; then
    echo -e "${GREEN}  ✅ Users table has proper snake_case columns (first_name, last_name)${NC}"
else
    echo -e "${RED}  ❌ Users table missing snake_case columns${NC}"
    echo "  Expected: first_name, last_name"
    echo "  Run schema push to fix this"
fi

if psql "$DATABASE_URL" -c "\d batches" 2>/dev/null | grep -q "class_time"; then
    echo -e "${GREEN}  ✅ Batches table has class_time column${NC}"
else
    echo -e "${YELLOW}  ⚠️  Batches table missing class_time column${NC}"
    echo "  This will be added by schema push"
fi

echo -e "${GREEN}🎉 Migration process completed!${NC}"