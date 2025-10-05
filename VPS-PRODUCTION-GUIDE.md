# VPS Production Deployment Guide for CoachManager

## 🚀 Complete VPS Setup Instructions

### Prerequisites
- Ubuntu 20.04+ or CentOS 8+ VPS
- Root or sudo access
- At least 2GB RAM, 20GB storage
- Domain name (optional but recommended)

### Step 1: Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git build-essential nginx certbot python3-certbot-nginx

# Create application user
sudo adduser coachmanager
sudo usermod -aG sudo coachmanager
sudo su - coachmanager
```

### Step 2: Install Node.js (LTS)

```bash
# Install Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 3: Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Setup database and user
sudo -u postgres psql

-- In PostgreSQL prompt:
CREATE DATABASE coachmanager;
CREATE USER coachmanager WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE coachmanager TO coachmanager;
ALTER USER coachmanager CREATEDB;
\q
```

### Step 4: Clone and Setup Application

```bash
# Clone the repository
cd /opt
sudo git clone https://github.com/yourusername/coachmanager.git
sudo chown -R coachmanager:coachmanager /opt/coachmanager
cd /opt/coachmanager

# Install dependencies
npm install --production

# Copy environment file
cp .env.production .env

# Edit environment variables
nano .env
```

### Step 5: Configure Environment Variables

Update `.env` with your actual values:

```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://coachmanager:your_secure_password@localhost:5432/coachmanager
SESSION_SECRET=your_very_long_secure_random_string_here

# Your domain
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# SMS Configuration (if using)
BULKSMS_API_KEY=your_sms_api_key
BULKSMS_API_SECRET=your_sms_secret

# AI API Keys (optional)
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_AI_API_KEY=your_google_ai_key
GEMINI_API_KEY=your_gemini_key
```

### Step 6: Database Migration

```bash
# Run database migrations
npm run db:migrate

# Verify database setup
psql postgresql://coachmanager:your_secure_password@localhost:5432/coachmanager -c "\dt"
```

### Step 7: Build Application

```bash
# Build the frontend and backend
npm run build

# Test the application
npm start
```

### Step 8: Setup Process Manager (PM2)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Create PM2 ecosystem file
cp ecosystem.config.cjs ecosystem.config.js

# Start application with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup
# Follow the instructions provided by pm2 startup command
```

### Step 9: Configure Nginx Reverse Proxy

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/coachmanager
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (React build)
    location / {
        root /opt/coachmanager/dist/public;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "public, max-age=31536000";
    }

    # API routes
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeout for long operations
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy strict-origin-when-cross-origin;
}
```

Enable the site:

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/coachmanager /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 10: Setup SSL with Let's Encrypt

```bash
# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Verify auto-renewal
sudo certbot renew --dry-run
```

### Step 11: Setup Firewall

```bash
# Configure UFW firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Check firewall status
sudo ufw status
```

### Step 12: Setup Monitoring and Backups

```bash
# Create backup directory
sudo mkdir -p /opt/coachmanager/backups
sudo chown coachmanager:coachmanager /opt/coachmanager/backups

# Create backup script
sudo nano /opt/coachmanager/backup.sh
```

Add backup script:

```bash
#!/bin/bash
BACKUP_DIR="/opt/coachmanager/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="coachmanager"
DB_USER="coachmanager"

# Create database backup
pg_dump -U $DB_USER -h localhost $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete

echo "Backup completed: db_backup_$DATE.sql"
```

Make it executable and add to cron:

```bash
sudo chmod +x /opt/coachmanager/backup.sh

# Add to crontab (daily backup at 2 AM)
crontab -e
# Add this line:
0 2 * * * /opt/coachmanager/backup.sh
```

### Step 13: Final Verification

```bash
# Check all services
sudo systemctl status nginx
sudo systemctl status postgresql
pm2 status

# Test the application
curl -I http://yourdomain.com
curl -I https://yourdomain.com/api/health
```

### Step 14: Performance Optimization

```bash
# Optimize PostgreSQL for production
sudo nano /etc/postgresql/12/main/postgresql.conf
```

Add these optimizations:

```
# Memory settings
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100

# Connection settings
max_connections = 100
```

Restart PostgreSQL:

```bash
sudo systemctl restart postgresql
```

## 🔧 Maintenance Commands

### Application Management
```bash
# Restart application
pm2 restart all

# View logs
pm2 logs

# Update application
cd /opt/coachmanager
git pull origin main
npm install --production
npm run build
pm2 restart all
```

### Database Management
```bash
# Connect to database
psql postgresql://coachmanager:password@localhost:5432/coachmanager

# Run manual backup
/opt/coachmanager/backup.sh

# Restore from backup
psql postgresql://coachmanager:password@localhost:5432/coachmanager < backup_file.sql
```

### System Monitoring
```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check application status
pm2 monit
```

## 🛡️ Security Checklist

- [ ] Strong database passwords
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Regular backups scheduled
- [ ] Non-root user for application
- [ ] Environment variables secured
- [ ] Nginx security headers configured
- [ ] PostgreSQL properly secured
- [ ] SSH key authentication (recommended)
- [ ] Fail2ban installed (recommended)

## 🚨 Troubleshooting

### Application won't start
```bash
# Check logs
pm2 logs
# Check environment variables
cat .env
# Check database connection
psql $DATABASE_URL
```

### Database connection issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql
# Check database exists
sudo -u postgres psql -l
# Test connection
psql postgresql://coachmanager:password@localhost:5432/coachmanager
```

### Nginx issues
```bash
# Check Nginx status
sudo systemctl status nginx
# Test configuration
sudo nginx -t
# Check error logs
sudo tail -f /var/log/nginx/error.log
```

## 📝 Post-Deployment

1. Create admin user through the application
2. Test all features (student creation, batch management, etc.)
3. Setup monitoring alerts
4. Configure regular maintenance
5. Document any customizations
6. Test backup and restore procedures

Your CoachManager application is now ready for production use! 🎉