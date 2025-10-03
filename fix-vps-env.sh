#!/bin/bash

# Quick VPS Environment Fix
# This script fixes the DATABASE_URL to use PostgreSQL instead of SQLite

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔧 Fixing VPS Environment - PostgreSQL Setup"

# Your PostgreSQL credentials
POSTGRES_URL="postgres://saro:saro@localhost:5432/saro_db"

# Update .env file
echo "📝 Updating .env file..."
cat > .env << EOF
# Database Configuration - PostgreSQL
DATABASE_URL=$POSTGRES_URL

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production-64-chars

# Application Configuration
NODE_ENV=production
PORT=3001

# VPS Configuration
PM2_HOME=/root/.pm2
EOF

echo -e "${GREEN}✅ Updated .env file with PostgreSQL URL${NC}"

# Update .bashrc
echo "📝 Updating .bashrc..."
# Remove old DATABASE_URL lines
sed -i '/export DATABASE_URL/d' ~/.bashrc 2>/dev/null || true

# Add new PostgreSQL DATABASE_URL
echo "" >> ~/.bashrc
echo "# Saroyar Application Environment - PostgreSQL" >> ~/.bashrc
echo "export DATABASE_URL='$POSTGRES_URL'" >> ~/.bashrc
echo "export NODE_ENV='production'" >> ~/.bashrc
echo "export SESSION_SECRET='your-super-secret-session-key-change-this-in-production-64-chars'" >> ~/.bashrc

echo -e "${GREEN}✅ Updated .bashrc with PostgreSQL URL${NC}"

# Update PM2 ecosystem file
echo "📝 Updating PM2 ecosystem configuration..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'saroyar',
    script: 'dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      DATABASE_URL: '$POSTGRES_URL',
      SESSION_SECRET: 'your-super-secret-session-key-change-this-in-production-64-chars'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001,
      DATABASE_URL: '$POSTGRES_URL',
      SESSION_SECRET: 'your-super-secret-session-key-change-this-in-production-64-chars'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

echo -e "${GREEN}✅ Updated PM2 ecosystem configuration${NC}"

# Export for current session
export DATABASE_URL="$POSTGRES_URL"
export NODE_ENV="production"

echo "🔍 Testing PostgreSQL connection..."
if command -v psql >/dev/null 2>&1; then
    if psql "$POSTGRES_URL" -c "SELECT version();" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ PostgreSQL connection successful${NC}"
    else
        echo -e "${RED}❌ PostgreSQL connection failed${NC}"
        echo "Please ensure PostgreSQL is running and credentials are correct:"
        echo "  User: saro"
        echo "  Password: saro"
        echo "  Database: saro_db"
        echo "  Host: localhost:5432"
    fi
else
    echo -e "${YELLOW}⚠️  psql not available, but DATABASE_URL is set${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Environment fix completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Source the environment: source ~/.bashrc"
echo "2. Run migrations: ./run-migrations.sh"
echo "3. Restart PM2: pm2 restart saroyar --update-env"
echo ""
echo "Your DATABASE_URL is now: $POSTGRES_URL"