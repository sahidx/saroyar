#!/bin/bash

# VPS Deployment Script for Saroyar Application
# This script handles the complete deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="saroyar"
APP_DIR="/var/www/saroyar"
DB_NAME="saroyar_production"
DB_USER="saroyar_user"
NODE_VERSION="20"

# Functions
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
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root. Please run as a regular user with sudo privileges."
    fi
}

# Install dependencies
install_dependencies() {
    log "Installing system dependencies..."
    
    sudo apt update
    sudo apt install -y curl wget git nginx ufw postgresql postgresql-contrib
    
    # Install Node.js if not installed
    if ! command -v node &> /dev/null; then
        log "Installing Node.js ${NODE_VERSION}..."
        curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
        sudo apt install -y nodejs
    fi
    
    # Install PM2 if not installed
    if ! command -v pm2 &> /dev/null; then
        log "Installing PM2..."
        sudo npm install -g pm2
    fi
    
    log "Dependencies installed successfully"
}

# Setup firewall
setup_firewall() {
    log "Configuring firewall..."
    
    sudo ufw --force reset
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    sudo ufw allow ssh
    sudo ufw allow 'Nginx Full'
    sudo ufw --force enable
    
    log "Firewall configured successfully"
}

# Setup PostgreSQL
setup_database() {
    log "Setting up PostgreSQL database..."
    
    # Check if PostgreSQL is running
    if ! sudo systemctl is-active --quiet postgresql; then
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
    fi
    
    # Create database and user if they don't exist
    sudo -u postgres psql << EOF
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${DB_USER}') THEN
        CREATE USER ${DB_USER} WITH ENCRYPTED PASSWORD '$(openssl rand -base64 32)';
    END IF;
END
\$\$;

SELECT 'CREATE DATABASE ${DB_NAME}' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\gexec

GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
GRANT ALL ON SCHEMA public TO ${DB_USER};
ALTER USER ${DB_USER} CREATEDB;
EOF
    
    log "Database setup completed"
}

# Clone or update repository
setup_application() {
    log "Setting up application..."
    
    if [ ! -d "$APP_DIR" ]; then
        sudo mkdir -p /var/www
        cd /var/www
        sudo git clone https://github.com/sahidx/saroyar.git
        sudo chown -R $USER:$USER saroyar
    else
        cd $APP_DIR
        git pull origin main
    fi
    
    cd $APP_DIR
    
    # Install npm dependencies
    log "Installing npm dependencies..."
    npm install
    
    log "Application setup completed"
}

# Setup environment variables
setup_environment() {
    log "Setting up environment variables..."
    
    if [ ! -f "$APP_DIR/.env" ]; then
        # Generate secure passwords and secrets
        DB_PASSWORD=$(openssl rand -base64 32)
        SESSION_SECRET=$(openssl rand -base64 48)
        
        cat > $APP_DIR/.env << EOF
# Database Configuration
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}

# Server Configuration
NODE_ENV=production
PORT=3001

# Session Configuration
SESSION_SECRET=${SESSION_SECRET}

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# API Keys (UPDATE THESE WITH YOUR ACTUAL KEYS)
GEMINI_API_KEY=your_gemini_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_SERVICE_ACCOUNT_KEY=your_google_service_account_key_here

# SMS Configuration (if using)
SMS_API_KEY=your_sms_api_key_here
SMS_SECRET=your_sms_secret_here
EOF
        
        # Update database password
        sudo -u postgres psql << EOF
ALTER USER ${DB_USER} WITH ENCRYPTED PASSWORD '${DB_PASSWORD}';
EOF
        
        chmod 600 $APP_DIR/.env
        warn "Environment file created at $APP_DIR/.env"
        warn "IMPORTANT: Update the API keys in the .env file before starting the application!"
    else
        info "Environment file already exists"
    fi
}

# Build application
build_application() {
    log "Building application..."
    
    cd $APP_DIR
    npm run build:production
    
    log "Application built successfully"
}

# Setup Nginx
setup_nginx() {
    log "Setting up Nginx..."
    
    # Remove default site
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/saroyar << EOF
server {
    listen 80;
    server_name _;  # Replace with your domain
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3001;
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }
}
EOF
    
    # Enable site
    sudo ln -sf /etc/nginx/sites-available/saroyar /etc/nginx/sites-enabled/
    
    # Test configuration
    sudo nginx -t
    
    # Start and enable Nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    log "Nginx configured successfully"
}

# Setup PM2
setup_pm2() {
    log "Setting up PM2..."
    
    cd $APP_DIR
    
    # Stop existing processes
    pm2 delete saroyar 2>/dev/null || true
    
    # Start application with PM2
    pm2 start ecosystem.config.cjs
    
    # Generate startup script
    pm2 startup | grep -E '^sudo' | sh || true
    
    # Save process list
    pm2 save
    
    log "PM2 configured successfully"
}

# Setup database backup
setup_backup() {
    log "Setting up database backup..."
    
    sudo tee /usr/local/bin/backup-saroyar-db.sh << EOF
#!/bin/bash
BACKUP_DIR="/var/backups/postgresql"
DATE=\$(date +%Y%m%d_%H%M%S)

mkdir -p \$BACKUP_DIR

# Backup database
sudo -u postgres pg_dump ${DB_NAME} > \$BACKUP_DIR/${DB_NAME}_\$DATE.sql

# Keep only last 7 days of backups
find \$BACKUP_DIR -name "${DB_NAME}_*.sql" -mtime +7 -delete

echo "Database backup completed: \$BACKUP_DIR/${DB_NAME}_\$DATE.sql"
EOF
    
    sudo chmod +x /usr/local/bin/backup-saroyar-db.sh
    
    # Add to crontab (daily at 2 AM)
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-saroyar-db.sh") | crontab -
    
    log "Database backup configured successfully"
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Check if application is running
    sleep 5
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        log "Application health check passed"
    else
        warn "Application health check failed - check PM2 logs with: pm2 logs saroyar"
    fi
    
    # Check database connection
    if sudo -u postgres psql -d $DB_NAME -c "SELECT 1" > /dev/null 2>&1; then
        log "Database health check passed"
    else
        error "Database health check failed"
    fi
    
    # Check Nginx
    if sudo nginx -t > /dev/null 2>&1; then
        log "Nginx configuration is valid"
    else
        error "Nginx configuration is invalid"
    fi
}

# Display final information
display_info() {
    log "Deployment completed successfully!"
    echo
    info "Application Details:"
    info "- Application Directory: $APP_DIR"
    info "- Database: $DB_NAME"
    info "- Port: 3001"
    info "- Environment: Production"
    echo
    info "Useful Commands:"
    info "- Check application status: pm2 status"
    info "- View logs: pm2 logs saroyar"
    info "- Restart application: pm2 restart saroyar"
    info "- Database backup: sudo /usr/local/bin/backup-saroyar-db.sh"
    echo
    warn "IMPORTANT: Don't forget to:"
    warn "1. Update API keys in $APP_DIR/.env"
    warn "2. Configure your domain in /etc/nginx/sites-available/saroyar"
    warn "3. Setup SSL certificate with: sudo certbot --nginx"
    echo
    info "Your application should be accessible at:"
    info "- Local: http://localhost:3001"
    info "- Public: http://$(curl -s ifconfig.me)"
}

# Main execution
main() {
    log "Starting VPS deployment for $APP_NAME..."
    
    check_root
    install_dependencies
    setup_firewall
    setup_database
    setup_application
    setup_environment
    build_application
    setup_nginx
    setup_pm2
    setup_backup
    health_check
    display_info
}

# Run main function
main "$@"