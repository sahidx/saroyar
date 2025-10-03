#!/bin/bash

# VPS Environment Setup Script
# This ensures DATABASE_URL persists across all sessions and PM2 processes

set -e

echo "🔧 Setting up persistent environment variables for VPS..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Default database credentials for VPS PostgreSQL
DEFAULT_DB_USER="saro"
DEFAULT_DB_PASSWORD="saro"
DEFAULT_DB_HOST="localhost"
DEFAULT_DB_PORT="5432"
DEFAULT_DB_NAME="saro_db"
DEFAULT_POSTGRES_URL="postgres://${DEFAULT_DB_USER}:${DEFAULT_DB_PASSWORD}@${DEFAULT_DB_HOST}:${DEFAULT_DB_PORT}/${DEFAULT_DB_NAME}"

# Check if DATABASE_URL is already set
if [ -n "$DATABASE_URL" ]; then
    echo -e "${GREEN}✅ DATABASE_URL is already set in current session${NC}"
    # If it's still pointing to SQLite, override it
    if [[ "$DATABASE_URL" == *"sqlite"* ]] || [[ "$DATABASE_URL" == "file:"* ]]; then
        echo -e "${YELLOW}⚠️  DATABASE_URL is set to SQLite, overriding with PostgreSQL${NC}"
        CURRENT_DB_URL="$DEFAULT_POSTGRES_URL"
    else
        CURRENT_DB_URL="$DATABASE_URL"
    fi
else
    echo -e "${YELLOW}⚠️  DATABASE_URL not set in current session${NC}"
    CURRENT_DB_URL="$DEFAULT_POSTGRES_URL"
fi

# Mask password for display
MASKED_URL=$(echo "$CURRENT_DB_URL" | sed 's/:\/\/[^:]*:[^@]*@/:\/\/***:***@/')
echo -e "${BLUE}📋 Using DATABASE_URL: $MASKED_URL${NC}"

# Create .env file for the project
echo "📝 Creating .env file..."
cat > .env << EOF
# Database Configuration
DATABASE_URL=$CURRENT_DB_URL

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production-64-chars

# Application Configuration
NODE_ENV=production
PORT=3001

# VPS Configuration
PM2_HOME=/root/.pm2
EOF

echo -e "${GREEN}✅ Created .env file${NC}"

# Add to .bashrc for persistent shell sessions
echo "📝 Adding to .bashrc for persistent environment..."
if ! grep -q "export DATABASE_URL" ~/.bashrc; then
    echo "" >> ~/.bashrc
    echo "# Saroyar Application Environment" >> ~/.bashrc
    echo "export DATABASE_URL='$CURRENT_DB_URL'" >> ~/.bashrc
    echo "export NODE_ENV='production'" >> ~/.bashrc
    echo "export SESSION_SECRET='your-super-secret-session-key-change-this-in-production-64-chars'" >> ~/.bashrc
    echo -e "${GREEN}✅ Added environment variables to .bashrc${NC}"
else
    echo -e "${YELLOW}⚠️  Environment variables already exist in .bashrc${NC}"
fi

# Create PM2 ecosystem file with environment variables
echo "📝 Creating PM2 ecosystem configuration..."
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
      DATABASE_URL: '$CURRENT_DB_URL',
      SESSION_SECRET: 'your-super-secret-session-key-change-this-in-production-64-chars'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001,
      DATABASE_URL: '$CURRENT_DB_URL',
      SESSION_SECRET: 'your-super-secret-session-key-change-this-in-production-64-chars'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

echo -e "${GREEN}✅ Created PM2 ecosystem configuration${NC}"

# Create logs directory
mkdir -p logs

# Test the database connection
echo "🔍 Testing database connection..."
if command -v psql >/dev/null 2>&1; then
    if psql "$CURRENT_DB_URL" -c "SELECT version();" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Database connection successful${NC}"
    else
        echo -e "${RED}❌ Database connection failed${NC}"
        echo "Please check your database credentials and ensure PostgreSQL is running"
    fi
else
    echo -e "${YELLOW}⚠️  psql not available, skipping connection test${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Environment setup completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Source the environment: source ~/.bashrc"
echo "2. Run database setup: npm run db:setup-complete"
echo "3. Build and deploy: npm run vps:deploy"
echo ""
echo "Environment variables are now persistent across:"
echo "- ✅ Shell sessions (.bashrc)"
echo "- ✅ PM2 processes (ecosystem.config.js)"
echo "- ✅ Node.js application (.env)"