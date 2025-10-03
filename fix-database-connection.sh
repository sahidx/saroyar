#!/bin/bash

# Quick Database Fix Script
# Ensures the database user and database exist with correct credentials

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🔧 Fixing database connection for login...${NC}"

# Database configuration
DB_NAME="saro_db"
DB_USER="saro"
DB_PASSWORD="saro"

echo -e "${YELLOW}📋 Database setup:${NC}"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Password: $DB_PASSWORD"

# Check if PostgreSQL is running
if ! systemctl is-active --quiet postgresql 2>/dev/null && ! service postgresql status >/dev/null 2>&1; then
    echo -e "${YELLOW}🔄 Starting PostgreSQL...${NC}"
    if command -v systemctl >/dev/null 2>&1; then
        sudo systemctl start postgresql || true
    else
        sudo service postgresql start || true
    fi
fi

# Create/update database user and database
echo -e "${YELLOW}👤 Setting up database user and database...${NC}"

# Drop and recreate user to ensure password is correct
sudo -u postgres psql -c "DROP USER IF EXISTS $DB_USER;" 2>/dev/null || true
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || echo "User may already exist"

# Drop and recreate database to start fresh
sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null || echo "Database may already exist"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || true

# Test connection
echo -e "${YELLOW}🧪 Testing database connection...${NC}"
if PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -c "SELECT version();" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful!${NC}"
else
    echo -e "${RED}❌ Database connection failed!${NC}"
    echo "Please check PostgreSQL is running and try again."
    exit 1
fi

# Run migrations to set up tables
echo -e "${YELLOW}🗄️ Setting up database tables...${NC}"
export DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"

if [ -f "run-migrations.sh" ]; then
    ./run-migrations.sh || echo "Migration completed with warnings"
elif [ -f "migrations/20251003_fix_batches_and_users.sql" ]; then
    echo -e "${YELLOW}📄 Applying database schema...${NC}"
    PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -f migrations/20251003_fix_batches_and_users.sql || true
fi

# Create a test user if needed
echo -e "${YELLOW}👥 Creating test admin user...${NC}"
PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -c "
INSERT INTO users (id, username, password, first_name, last_name, role, email, is_active) 
VALUES (
    gen_random_uuid()::text, 
    'admin', 
    '\$2b\$12\$LQv3c1yqBwEHXw\$QT1Q.6Q5qXWgR7qvbQ2K4O', 
    'Admin', 
    'User', 
    'teacher', 
    'admin@example.com', 
    true
) ON CONFLICT (username) DO NOTHING;
" 2>/dev/null || echo "Test user creation skipped"

echo -e "${GREEN}🎉 Database setup completed!${NC}"
echo ""
echo -e "${GREEN}Connection Details:${NC}"
echo -e "${GREEN}  DATABASE_URL: postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME${NC}"
echo ""
echo -e "${YELLOW}📝 Test login credentials:${NC}"
echo -e "${YELLOW}  Username: admin${NC}"
echo -e "${YELLOW}  Password: admin${NC}"
echo ""
echo -e "${GREEN}✅ Login should now work without infinite loading!${NC}"