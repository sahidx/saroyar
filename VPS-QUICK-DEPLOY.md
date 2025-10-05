# 🚀 QUICK VPS DEPLOYMENT FIX

**The issues have been resolved!** Here's what was fixed and how to deploy on your VPS:

## ✅ Issues Fixed

### 1. **ESBuild @shared/* Alias Resolution**
- **Problem**: esbuild couldn't resolve `@shared/*` imports in production builds
- **Solution**: Updated build script with proper alias configuration: `--alias:@shared=shared`

### 2. **Login Loading Issue** 
- **Problem**: Frontend was using mock authentication instead of real API calls
- **Solution**: Replaced mock login with real `/api/auth/login` API calls

### 3. **Production Database Setup**
- **Problem**: Inconsistent PostgreSQL configuration
- **Solution**: Created automated production setup script

---

## 🔥 VPS Deployment Commands

**Run these commands on your VPS:**

```bash
# 1. Navigate to your project directory
cd /var/www/saroyar

# 2. Pull the latest fixes
git pull origin main

# 3. Run the production setup script
chmod +x setup-production.sh
./setup-production.sh
```

**That's it!** The setup script will:
- ✅ Check PostgreSQL installation
- ✅ Create database and user
- ✅ Install dependencies (including build tools)
- ✅ Run database migrations  
- ✅ Build frontend (897KB optimized)
- ✅ Build backend (355KB optimized)
- ✅ Start with PM2

---

## 🔧 Manual Deployment (Alternative)

If the script doesn't work, run these commands manually:

```bash
# Pull latest code
git pull origin main

# Install all dependencies (including build tools)
npm install --production=false

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Create PostgreSQL database
sudo -u postgres psql -c "CREATE USER saro WITH PASSWORD 'saro';"
sudo -u postgres psql -c "CREATE DATABASE saro_db OWNER saro;"

# Run migrations and build
npm run db:migrate
npm run build

# Start application
npm run start:pm2
```

---

## 🗄️ Database Credentials

**Default PostgreSQL setup:**
```env
DATABASE_URL=postgresql://saro:saro@localhost:5432/saro_db
```

**Login Credentials for Testing:**
- Phone: `01762602056` 
- Password: `sir@123@` (or check your user table)

---

## ✨ Build Information

**Frontend**: 897KB optimized bundle (React + Vite)
**Backend**: 355KB optimized bundle (Express + TypeScript)
**Database**: PostgreSQL with full schema

---

## 🔍 Verification

After deployment, check:

```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs saroyar

# Test the API
curl http://localhost:3000/healthz

# Test login endpoint
curl -X POST -H "Content-Type: application/json" \
  -d '{"phoneNumber":"01762602056","password":"sir@123@"}' \
  http://localhost:3000/api/auth/login
```

**Application URLs:**
- Main App: http://your-server-ip:3000
- Login: http://your-server-ip:3000/login  
- Health: http://your-server-ip:3000/healthz

---

## 🛠️ Troubleshooting

**If build fails:**
```bash
# Clear cache and rebuild
rm -rf node_modules/.cache dist server/public
npm install --production=false
npm run build
```

**If login doesn't work:**
1. Check PostgreSQL is running: `systemctl status postgresql`
2. Verify database connection: `psql postgresql://saro:saro@localhost:5432/saro_db`
3. Check application logs: `pm2 logs saroyar`

**If PostgreSQL issues:**
```bash
# Restart PostgreSQL
sudo systemctl restart postgresql

# Reset database
sudo -u postgres dropdb saro_db
sudo -u postgres createdb saro_db -O saro
npm run db:migrate
```

---

## 🎯 Success Indicators

✅ **Frontend builds successfully** (897KB bundle)  
✅ **Backend builds successfully** (355KB bundle)  
✅ **Database connection established**  
✅ **PM2 process running**  
✅ **Login authentication working**  
✅ **API endpoints responding**  

**Your Coach Manager System is now production-ready! 🎉**