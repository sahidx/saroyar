#!/bin/bash

# Complete VPS Production Deployment Script
# This script handles everything needed for production deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="saroyar"
DB_NAME="saro_db"
DB_USER="saro"
DB_PASSWORD="saro_secure_2024_$(date +%s)"
NODE_VERSION="20"

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    error "This script should not be run as root. Please run as a regular user with sudo privileges."
fi

log "🚀 Starting VPS Production Deployment for ${APP_NAME}..."

# Update system
log "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js
log "📦 Installing Node.js ${NODE_VERSION}..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
log "📦 Installing PM2..."
sudo npm install -g pm2

# Install PostgreSQL
log "📦 Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
log "🔧 Starting PostgreSQL service..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Setup database
log "🗄️ Setting up database..."
sudo -u postgres psql -c "DROP DATABASE IF EXISTS ${DB_NAME};"
sudo -u postgres psql -c "DROP USER IF EXISTS ${DB_USER};"
sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';"
sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"

# Configure PostgreSQL for connections
log "🔒 Configuring PostgreSQL authentication..."
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/*/main/postgresql.conf
sudo sed -i "s/local   all             all                                     peer/local   all             all                                     md5/" /etc/postgresql/*/main/pg_hba.conf
sudo sed -i "s/host    all             all             127.0.0.1\/32            ident/host    all             all             127.0.0.1\/32            md5/" /etc/postgresql/*/main/pg_hba.conf

# Restart PostgreSQL
sudo systemctl restart postgresql

# Test database connection
log "🧪 Testing database connection..."
PGPASSWORD=${DB_PASSWORD} psql -h localhost -U ${DB_USER} -d ${DB_NAME} -c "SELECT version();" || error "Database connection failed!"

# Install dependencies
log "📦 Installing Node.js dependencies..."
npm install

# Create production environment file
log "⚙️ Creating production environment file..."
cat > .env.production << EOF
# Production Environment Configuration
NODE_ENV=production
PORT=3001

# Database Configuration
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}

# Session Configuration
SESSION_SECRET=$(openssl rand -hex 32)

# Disable seeding in production
DISABLE_SEEDING=true

# AI API Keys (Update with your actual keys)
ANTHROPIC_API_KEY=your_anthropic_key_here
GOOGLE_AI_API_KEY=your_google_ai_key_here

# SMS Configuration (Update with your actual credentials)
INFOBIP_API_KEY=your_infobip_api_key_here
INFOBIP_BASE_URL=https://api.infobip.com

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Security Configuration
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF

# Copy production env to main env
cp .env.production .env

# Build the application
log "🔨 Building application..."
npm run build

# Run database migrations
log "🗄️ Running database migrations..."
export $(cat .env.production | grep -v '^#' | xargs)
npx drizzle-kit generate --name "initial_production_schema"
npx drizzle-kit migrate

# Create PM2 ecosystem file
log "⚙️ Creating PM2 configuration..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '${APP_NAME}',
    script: './server/index.ts',
    interpreter: 'node',
    interpreter_args: '--loader ts-node/esm',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    log_file: './logs/app.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=4096',
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'uploads'],
    restart_delay: 5000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Install TypeScript and ts-node for production
npm install -g typescript ts-node

# Start application with PM2
log "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Setup firewall
log "🔥 Configuring firewall..."
sudo ufw allow 3001/tcp
sudo ufw allow 22/tcp
sudo ufw allow 5432/tcp
sudo ufw --force enable

# Setup nginx reverse proxy
log "🌐 Setting up Nginx reverse proxy..."
sudo apt install -y nginx

cat << EOF | sudo tee /etc/nginx/sites-available/${APP_NAME}
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static files
    location /static/ {
        alias ./client/dist/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable nginx site
sudo ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# Create database backup script
log "💾 Setting up database backup..."
cat << 'EOF' | sudo tee /usr/local/bin/backup-saroyar-db.sh
#!/bin/bash
BACKUP_DIR="/var/backups/saroyar"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
PGPASSWORD="${DB_PASSWORD}" pg_dump -h localhost -U ${DB_USER} ${DB_NAME} > $BACKUP_DIR/${DB_NAME}_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

echo "Database backup completed: $BACKUP_DIR/${DB_NAME}_$DATE.sql"
EOF

sudo chmod +x /usr/local/bin/backup-saroyar-db.sh

# Add daily backup cron job
echo "0 2 * * * /usr/local/bin/backup-saroyar-db.sh" | sudo crontab -

# Setup log rotation
log "📋 Setting up log rotation..."
cat << EOF | sudo tee /etc/logrotate.d/${APP_NAME}
./logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $(whoami) $(whoami)
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Final health check
log "🏥 Running final health check..."
sleep 10

if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    log "✅ Application is running successfully!"
else
    warn "⚠️ Health check failed, but application might still be starting..."
fi

# Display deployment summary
log "🎉 Deployment completed successfully!"
echo ""
echo -e "${GREEN}==================== DEPLOYMENT SUMMARY ====================${NC}"
echo -e "${BLUE}Application: ${APP_NAME}${NC}"
echo -e "${BLUE}URL: http://your-vps-ip:3001${NC}"
echo -e "${BLUE}Database: ${DB_NAME}${NC}"
echo -e "${BLUE}Database User: ${DB_USER}${NC}"
echo -e "${BLUE}PM2 Status: pm2 status${NC}"
echo -e "${BLUE}Logs: pm2 logs ${APP_NAME}${NC}"
echo -e "${BLUE}Restart: pm2 restart ${APP_NAME}${NC}"
echo -e "${BLUE}Stop: pm2 stop ${APP_NAME}${NC}"
echo -e "${BLUE}Database Backup: sudo /usr/local/bin/backup-saroyar-db.sh${NC}"
echo ""
echo -e "${YELLOW}Important: Update the AI API keys in .env.production${NC}"
echo -e "${YELLOW}Database Password: ${DB_PASSWORD}${NC}"
echo -e "${GREEN}=============================================================${NC}"

log "✅ Production deployment completed successfully!"