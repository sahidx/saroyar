#!/bin/bash

# Production Migration Script
set -e

echo "🚀 Running Production Migrations..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
    echo -e "${GREEN}✅ Loaded production environment${NC}"
else
    echo -e "${RED}❌ .env.production file not found!${NC}"
    exit 1
fi

# Check if database is accessible
echo -e "${YELLOW}🔍 Checking database connection...${NC}"
if ! npx drizzle-kit introspect; then
    echo -e "${RED}❌ Cannot connect to database!${NC}"
    echo -e "${YELLOW}Make sure PostgreSQL is running and DATABASE_URL is correct${NC}"
    exit 1
fi

echo -e "${YELLOW}📝 Generating fresh migration...${NC}"
# Generate initial migration from schema
npx drizzle-kit generate --name "initial_production_schema"

echo -e "${YELLOW}🔄 Applying migrations...${NC}"
# Apply the migration
npx drizzle-kit migrate

echo -e "${GREEN}✅ Migration completed successfully!${NC}"

# Verify tables were created
echo -e "${YELLOW}🔍 Verifying database schema...${NC}"
npx drizzle-kit introspect

echo -e "${GREEN}✅ Production database is ready!${NC}"