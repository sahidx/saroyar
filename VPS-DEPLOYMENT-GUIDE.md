# 🚀 VPS Deployment Guide - Chemistry & ICT Care by Belal Sir

This guide will help you deploy the coaching center management system on any VPS (Virtual Private Server).

## 📋 Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Storage**: Minimum 20GB SSD
- **Network**: Public IP address
- **Domain** (Optional): For SSL setup

### Software Requirements
- **Node.js**: Version 18+ 
- **PostgreSQL**: Version 13+
- **Git**: For code deployment
- **nginx** (Optional): For reverse proxy and SSL

## 🔧 Quick Deployment (Automated)

### Method 1: One-Command Deployment
```bash
# Clone and deploy in one go
git clone https://github.com/your-repo/chemistry-ict-care.git
cd chemistry-ict-care
chmod +x deploy-vps.sh
./deploy-vps.sh
```

### Method 2: Docker Deployment
```bash
# Using Docker Compose
git clone https://github.com/your-repo/chemistry-ict-care.git
cd chemistry-ict-care
cp .env.example .env
# Edit .env with your configuration
docker-compose up -d
```

## 🛠️ Manual Deployment Steps

### Step 1: Server Setup

#### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

#### Install Node.js 18+
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Install PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Step 2: Database Setup

#### Create Database User and Database
```bash
sudo -u postgres psql
```
```sql
CREATE USER chemistry_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE chemistry_ict_care OWNER chemistry_user;
GRANT ALL PRIVILEGES ON DATABASE chemistry_ict_care TO chemistry_user;
\q
```

### Step 3: Application Deployment

#### Clone Repository
```bash
git clone https://github.com/your-repo/chemistry-ict-care.git
cd chemistry-ict-care
```

#### Configure Environment
```bash
cp .env.example .env
nano .env
```

Configure your `.env` file:
```env
# Database Configuration
DATABASE_URL=postgresql://chemistry_user:your_secure_password@localhost:5432/chemistry_ict_care

# Security
SESSION_SECRET=your_very_secure_session_secret_here
NODE_ENV=production

# SMS Service
BULKSMS_API_KEY=your_bulksms_api_key

# AI Service (Optional)
GEMINI_API_KEY=your_gemini_api_key

# Server Configuration
PORT=5000
```

#### Install and Build
```bash
npm install
npm run db:push --force
npm run build
```

### Step 4: Process Management (Production)

#### Create Systemd Service
```bash
sudo nano /etc/systemd/system/chemistry-ict-care.service
```

```ini
[Unit]
Description=Chemistry & ICT Care by Belal Sir
After=network.target postgresql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/chemistry-ict-care
Environment=NODE_ENV=production
EnvironmentFile=/home/ubuntu/chemistry-ict-care/.env
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=chemistry-ict-care

[Install]
WantedBy=multi-user.target
```

#### Start Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable chemistry-ict-care
sudo systemctl start chemistry-ict-care
sudo systemctl status chemistry-ict-care
```

### Step 5: Firewall Configuration

#### UFW (Ubuntu)
```bash
sudo ufw allow ssh
sudo ufw allow 5000
sudo ufw enable
```

#### Firewalld (CentOS/RHEL)
```bash
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --permanent --add-port=5000/tcp
sudo firewall-cmd --reload
```

### Step 6: SSL Setup (Optional but Recommended)

#### Install Certbot
```bash
sudo apt install certbot nginx -y
```

#### Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/chemistry-ict-care
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Enable Site and Get SSL
```bash
sudo ln -s /etc/nginx/sites-available/chemistry-ict-care /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 🔍 Monitoring and Maintenance

### Health Check
```bash
curl http://localhost:5000/api/health
```

### View Logs
```bash
# Application logs
sudo journalctl -u chemistry-ict-care -f

# Nginx logs (if using)
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Database Backup
```bash
# Manual backup
sudo -u postgres pg_dump chemistry_ict_care > backup-$(date +%Y%m%d).sql

# Automated backup (add to crontab)
0 2 * * * sudo -u postgres pg_dump chemistry_ict_care > /backups/chemistry-$(date +\%Y\%m\%d).sql
```

### Update Application
```bash
cd /path/to/chemistry-ict-care
git pull origin main
npm install
npm run build
sudo systemctl restart chemistry-ict-care
```

## 🛡️ Security Best Practices

### 1. Server Security
- **Keep system updated**: `sudo apt update && sudo apt upgrade`
- **Disable root login**: Edit `/etc/ssh/sshd_config`
- **Use SSH keys**: Disable password authentication
- **Configure fail2ban**: `sudo apt install fail2ban`

### 2. Application Security
- **Strong passwords**: Use complex SESSION_SECRET and database passwords
- **Environment variables**: Never commit `.env` files to version control
- **Regular updates**: Keep Node.js and dependencies updated
- **SSL certificates**: Always use HTTPS in production

### 3. Database Security
- **Regular backups**: Automated daily backups
- **Access control**: Limit database access to application only
- **Connection encryption**: Use SSL for database connections

## 📊 Performance Optimization

### Database Optimization
```sql
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_students_batch ON users(batch_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_exams_created ON exams(created_at);
```

### Application Optimization
- **Enable gzip compression** in nginx
- **Use CDN** for static assets
- **Database connection pooling** (already configured)
- **Monitor memory usage** with `htop` or `pm2 monit`

## 🆘 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check database exists
sudo -u postgres psql -l | grep chemistry

# Test connection
psql "$DATABASE_URL" -c "SELECT 1"
```

#### 2. Port Already in Use
```bash
# Find process using port 5000
sudo lsof -i :5000

# Kill process if necessary
sudo kill -9 <PID>
```

#### 3. Application Won't Start
```bash
# Check logs
sudo journalctl -u chemistry-ict-care -n 50

# Check environment variables
sudo systemctl show chemistry-ict-care --property=Environment
```

#### 4. SSL Certificate Issues
```bash
# Renew certificate
sudo certbot renew

# Test certificate
sudo certbot certificates
```

## 📞 Support

For deployment issues or questions:
- **Email**: support@chemistry-ict-care.com
- **Documentation**: Check application logs and error messages
- **Health Check**: Visit `http://your-server:5000/api/health`

---

## 🎉 Success!

After successful deployment, your Chemistry & ICT Care coaching center management system will be available at:

- **HTTP**: `http://your-server-ip:5000`
- **HTTPS**: `https://your-domain.com` (if SSL configured)

### Default Login Credentials
- **Teacher**: `01712345678` / `sir123`
- **Student**: `01987654321` / `student123`

**⚠️ Important**: Change default passwords immediately after first login!

Happy teaching! 🧪💻📚