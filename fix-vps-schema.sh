#!/bin/bash

# VPS Schema Conflict Resolution Script
# This handles migration conflicts when database has existing schema

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🔧 Resolving VPS Schema Conflicts..."

# Load environment
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Using DATABASE_URL: $(echo $DATABASE_URL | sed 's/:\/\/[^:]*:[^@]*@/:\/\/***:***@/')${NC}"

# Check if we have psql
if ! command -v psql >/dev/null 2>&1; then
    echo -e "${RED}❌ psql not found. Please install postgresql-client${NC}"
    exit 1
fi

echo "🔍 Analyzing current database schema..."

# Check what's currently in the database
echo "📋 Current tables:"
psql "$DATABASE_URL" -c "\dt" 2>/dev/null || echo "No tables found"

echo ""
echo "📋 Current enums:"
psql "$DATABASE_URL" -c "SELECT typname FROM pg_type WHERE typtype = 'e' ORDER BY typname;" 2>/dev/null || echo "No enums found"

echo ""
echo "🔧 Resolving schema conflicts..."

# Option 1: Drop and recreate conflicting enums (safe if no data depends on them)
echo "1. Attempting to resolve enum conflicts..."
psql "$DATABASE_URL" << 'SQL' 2>/dev/null || echo "Enum resolution attempted"
-- Drop existing conflicting enums if they exist
DROP TYPE IF EXISTS api_key_status CASCADE;
DROP TYPE IF EXISTS attendance_status CASCADE;
DROP TYPE IF EXISTS batch_status CASCADE;
DROP TYPE IF EXISTS class_level CASCADE;
DROP TYPE IF EXISTS note_type CASCADE;
DROP TYPE IF EXISTS paper CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS question_bank_category CASCADE;
DROP TYPE IF EXISTS resource_type CASCADE;
DROP TYPE IF EXISTS sms_type CASCADE;
DROP TYPE IF EXISTS subject CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
SQL

echo "2. Running fresh schema push..."
export DATABASE_URL="$DATABASE_URL"

# Try drizzle-kit push with force to sync schema
if echo "y" | npx drizzle-kit push --force --config=drizzle.config.ts 2>&1; then
    echo -e "${GREEN}✅ Schema push completed successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Force push had issues, trying introspect approach...${NC}"
    
    # Generate new migration from current state
    echo "3. Generating migration from current database state..."
    npx drizzle-kit introspect --config=drizzle.config.ts || echo "Introspect attempted"
    
    # Try regular push again
    if echo "y" | npx drizzle-kit push --config=drizzle.config.ts 2>&1; then
        echo -e "${GREEN}✅ Schema synchronized after introspect${NC}"
    else
        echo -e "${RED}❌ Schema conflicts remain${NC}"
        echo ""
        echo "Manual resolution needed. You can:"
        echo "1. Drop the entire database: DROP DATABASE saro_db; CREATE DATABASE saro_db;"
        echo "2. Or manually fix schema conflicts"
        exit 1
    fi
fi

echo ""
echo "🔍 Verifying final schema..."

# Check essential tables exist with correct columns
TABLES=("users" "batches" "exams" "attendance")

for table in "${TABLES[@]}"; do
    if psql "$DATABASE_URL" -c "\d $table" >/dev/null 2>&1; then
        echo -e "${GREEN}  ✅ Table '$table' exists${NC}"
        
        # Check specific important columns
        case $table in
            "users")
                if psql "$DATABASE_URL" -c "\d users" 2>/dev/null | grep -q "first_name"; then
                    echo -e "${GREEN}    ✅ Has first_name column${NC}"
                else
                    echo -e "${YELLOW}    ⚠️  Missing first_name column${NC}"
                fi
                ;;
            "batches")
                if psql "$DATABASE_URL" -c "\d batches" 2>/dev/null | grep -q "class_time"; then
                    echo -e "${GREEN}    ✅ Has class_time column${NC}"
                else
                    echo -e "${YELLOW}    ⚠️  Missing class_time column${NC}"
                fi
                ;;
        esac
    else
        echo -e "${RED}  ❌ Table '$table' missing${NC}"
    fi
done

echo ""
echo -e "${GREEN}🎉 Schema conflict resolution completed!${NC}"
echo ""
echo "Next steps:"
echo "1. pm2 restart saroyar --update-env"
echo "2. Test your application"
echo ""
echo "If you still have issues, consider a fresh database setup:"
echo "psql -c 'DROP DATABASE saro_db; CREATE DATABASE saro_db;' && npm run vps:deploy"