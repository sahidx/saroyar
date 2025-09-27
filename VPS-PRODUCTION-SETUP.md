# VPS Production Setup Guide

## Prerequisites

- VPS with Ubuntu 20.04+ or similar Linux distribution
- Root or sudo access
- Domain name (optional but recommended)

## Step 1: Initial VPS Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git nginx ufw

# Setup firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

## Step 2: Install Node.js and PM2

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Verify installations
node --version
npm --version
pm2 --version
```

## Step 3: Install and Configure PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE saroyar_production;
CREATE USER saroyar_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE saroyar_production TO saroyar_user;
GRANT ALL ON SCHEMA public TO saroyar_user;
ALTER USER saroyar_user CREATEDB;
\q
EOF
```

## Step 4: Clone and Setup Application

```bash
# Navigate to web directory
cd /var/www

# Clone your repository (replace with your repo URL)
sudo git clone https://github.com/sahidx/saroyar.git
sudo chown -R $USER:$USER saroyar
cd saroyar

# Install dependencies
npm install
```

## Step 5: Environment Configuration

Create production environment file:

```bash
# Create .env file
cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://saroyar_user:your_secure_password_here@localhost:5432/saroyar_production

# Server Configuration
NODE_ENV=production
PORT=3001

# Session Configuration
SESSION_SECRET=your_super_secure_session_secret_here_minimum_32_chars

# API Keys (add your actual keys)
GEMINI_API_KEY=your_gemini_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_SERVICE_ACCOUNT_KEY=your_google_service_account_key

# SMS Configuration (if using)
SMS_API_KEY=your_sms_api_key
SMS_SECRET=your_sms_secret

# Additional security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF

# Secure the environment file
chmod 600 .env
```

## Step 6: Build and Deploy

```bash
# Build the application
npm run build:production

# Test the build
npm run start
# Press Ctrl+C to stop after verifying it works

# Start with PM2
npm run vps:deploy
```

## Step 7: Configure Nginx Reverse Proxy

```bash
sudo tee /etc/nginx/sites-available/saroyar << EOF
server {
    listen 80;
    server_name your_domain.com www.your_domain.com;  # Replace with your domain
    
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

# Enable the site
sudo ln -s /etc/nginx/sites-available/saroyar /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Start nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Step 8: SSL Certificate (Optional but Recommended)

```bash
# Install Certbot
sudo apt install -y snapd
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d your_domain.com -d www.your_domain.com

# Auto-renewal
sudo crontab -e
# Add this line:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## Step 9: PM2 Startup and Monitoring

```bash
# Generate startup script
pm2 startup

# Save PM2 process list
pm2 save

# Check status
pm2 status
pm2 logs saroyar

# Monitor resources
pm2 monit
```

## Step 10: Database Migration and Backup

```bash
# Run database migrations
cd /var/www/saroyar
npm run db:migrate

# Setup automated backups
sudo tee /usr/local/bin/backup-db.sh << EOF
#!/bin/bash
BACKUP_DIR="/var/backups/postgresql"
DATE=\$(date +%Y%m%d_%H%M%S)

mkdir -p \$BACKUP_DIR

# Backup database
sudo -u postgres pg_dump saroyar_production > \$BACKUP_DIR/saroyar_\$DATE.sql

# Keep only last 7 days of backups
find \$BACKUP_DIR -name "saroyar_*.sql" -mtime +7 -delete

echo "Database backup completed: \$BACKUP_DIR/saroyar_\$DATE.sql"
EOF

sudo chmod +x /usr/local/bin/backup-db.sh

# Setup daily backup cron
sudo crontab -e
# Add this line:
# 0 2 * * * /usr/local/bin/backup-db.sh
```

## Deployment Commands

### Initial Deployment
```bash
cd /var/www/saroyar
git pull origin main
npm install
npm run build:production
pm2 restart ecosystem.config.cjs
```

### Updates
```bash
cd /var/www/saroyar
git pull origin main
npm install
npm run vps:deploy
```

### Monitoring
```bash
# Check application status
pm2 status
pm2 logs saroyar

# Check system resources
pm2 monit

# Check nginx status
sudo systemctl status nginx

# Check database status
sudo systemctl status postgresql
sudo -u postgres psql -c "SELECT version();"
```

## Troubleshooting

### Application Issues
```bash
# Check PM2 logs
pm2 logs saroyar --lines 50

# Restart application
pm2 restart saroyar

# Check environment variables
pm2 env 0
```

### Database Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check database connection
sudo -u postgres psql saroyar_production -c "SELECT COUNT(*) FROM information_schema.tables;"

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Nginx Issues
```bash
# Check nginx status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## Security Checklist

- [x] Firewall configured (UFW)
- [x] SSL certificate installed
- [x] Strong database passwords
- [x] Environment variables secured
- [x] Regular backups scheduled
- [x] PM2 process monitoring
- [x] Nginx security headers
- [x] Database access restricted to localhost

## Performance Optimization

1. **Database Optimization**
   - Regular VACUUM and ANALYZE
   - Proper indexing
   - Connection pooling (already configured)

2. **Application Optimization**
   - PM2 cluster mode (if needed)
   - Memory limit monitoring
   - CPU usage optimization

3. **Nginx Optimization**
   - Gzip compression enabled
   - Static file caching
   - Proper proxy timeouts

## Maintenance

- Monitor disk space regularly
- Update dependencies monthly
- Review logs weekly
- Test backups monthly
- Update system packages regularly

Your application will be available at:
- HTTP: http://your_domain.com
- HTTPS: https://your_domain.com (if SSL configured)
- Direct IP: http://your_vps_ip (if domain not configured)