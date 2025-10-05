# 🚀 VPS Production Deployment Guide

This guide provides step-by-step instructions for deploying the Saroyar CoachManager application to a VPS with PostgreSQL.

## 📋 Prerequisites

- Ubuntu 20.04+ VPS with root access
- At least 2GB RAM and 20GB storage
- Domain name (optional but recommended)

## 🔧 Quick Deployment

### Option 1: One-Command Deployment (Recommended)

Run this single command on your VPS to deploy everything automatically:

```bash
curl -fsSL https://raw.githubusercontent.com/sahidx/saroyar/main/complete-vps-deployment.sh | bash
```

### Option 2: Manual Step-by-Step Deployment

1. **Clone the repository:**
```bash
git clone https://github.com/sahidx/saroyar.git
cd saroyar
chmod +x complete-vps-deployment.sh
./complete-vps-deployment.sh
```

## 🎯 What the Deployment Script Does

1. **System Setup:**
   - Updates system packages
   - Installs Node.js 20
   - Installs PM2 for process management
   - Installs PostgreSQL database

2. **Database Configuration:**
   - Creates production database `saro_db`
   - Creates database user `saro` with secure password
   - Configures PostgreSQL for connections
   - Tests database connectivity

3. **Application Setup:**
   - Installs Node.js dependencies
   - Creates production environment file
   - Builds the application
   - Runs database migrations

4. **Production Services:**
   - Starts application with PM2 in cluster mode
   - Sets up Nginx reverse proxy
   - Configures firewall (UFW)
   - Sets up automated database backups
   - Configures log rotation

## 🔐 Security Features

- **Database:** Secure random password generation
- **Sessions:** Cryptographically secure session secrets
- **Firewall:** Only necessary ports open (22, 80, 3001, 5432)
- **Process Management:** PM2 with auto-restart and clustering
- **Backups:** Daily automated database backups

## 📊 Post-Deployment

### Check Application Status
```bash
pm2 status
pm2 logs saroyar
```

### Database Management
```bash
# Backup database manually
sudo /usr/local/bin/backup-saroyar-db.sh

# Connect to database
PGPASSWORD="your_password" psql -h localhost -U saro -d saro_db
```

### Application Management
```bash
# Restart application
pm2 restart saroyar

# Stop application
pm2 stop saroyar

# View logs
pm2 logs saroyar --lines 100

# Monitor resources
pm2 monit
```

## 🌐 Access Your Application

After deployment, your application will be available at:
- **HTTP:** `http://your-vps-ip:3001`
- **Via Nginx:** `http://your-vps-ip` (port 80)

## 🔧 Configuration

### Environment Variables

The deployment creates `.env.production` with:
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secure session secret
- `NODE_ENV`: Set to production
- API keys for AI services (update with your keys)

### Database Schema

The application uses these main tables:
- `users` - User accounts (students, teachers, admins)
- `batches` - Class batches
- `exams` - Online examinations
- `questions` - Question bank
- `notices` - Announcements
- `messages` - Internal messaging

## 📈 Monitoring

### Health Checks
- Basic health: `GET /healthz`
- Detailed health: `GET /health`
- Metrics: `GET /metrics`

### Logs
- Application logs: `./logs/app.log`
- Error logs: `./logs/error.log`
- Output logs: `./logs/out.log`

## 🛠️ Troubleshooting

### Application Won't Start
```bash
# Check PM2 status
pm2 status

# Check logs for errors
pm2 logs saroyar --lines 50

# Restart application
pm2 restart saroyar
```

### Database Connection Issues
```bash
# Test database connection
PGPASSWORD="your_password" psql -h localhost -U saro -d saro_db -c "SELECT version();"

# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Port Issues
```bash
# Check if port 3001 is in use
sudo netstat -tlnp | grep 3001

# Check firewall status
sudo ufw status
```

## 🔄 Updates and Maintenance

### Application Updates
```bash
cd /path/to/saroyar
git pull origin main
npm install
npm run build
pm2 restart saroyar
```

### Database Migrations
```bash
npx drizzle-kit generate --name "migration_name"
npx drizzle-kit migrate
```

### Security Updates
```bash
sudo apt update && sudo apt upgrade -y
sudo systemctl restart postgresql
pm2 restart saroyar
```

## 🎯 Production Checklist

- [ ] Application starts successfully
- [ ] Database connections work
- [ ] Health endpoints respond
- [ ] Nginx proxy works
- [ ] Firewall is configured
- [ ] Backups are scheduled
- [ ] Log rotation is set up
- [ ] PM2 auto-startup is configured
- [ ] SSL certificate installed (recommended)
- [ ] Domain name configured (optional)

## 🆘 Support

If you encounter issues:
1. Check the logs: `pm2 logs saroyar`
2. Verify database connection
3. Check system resources: `pm2 monit`
4. Restart services if needed

## 🔒 Important Security Notes

1. **Change default passwords** in `.env.production`
2. **Add SSL certificate** for production use
3. **Update API keys** with your actual credentials
4. **Regular backups** are automated but verify they work
5. **Monitor logs** for suspicious activity

---

Your Saroyar CoachManager application is now production-ready! 🎉