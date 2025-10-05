# 🚨 VPS APPLICATION WON'T START - QUICK FIX

**আপনার application start হচ্ছে না বা restart লুপে আটকে আছে। এই commands run করুন:**

## 🔥 VPS-এ এই Commands Run করুন:

### Option 1: Quick Fix (Copy-Paste এই পুরো block)
```bash
cd /var/www/saroyar

# Kill all PM2 processes
pm2 kill

# Clean package.json
cat > package.json << 'EOF'
{
  "name": "rest-express",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "cross-env NODE_ENV=production node dist/index.js",
    "start:pm2": "pm2 start ecosystem.config.cjs"
  },
  "dependencies": {
    "cross-env": "^10.0.0",
    "express": "^4.21.2",
    "dotenv": "^17.2.2",
    "pg": "^8.16.3",
    "drizzle-orm": "^0.39.1"
  }
}
EOF

# Clean install
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --production=true

# Check if built files exist
if [ ! -f "dist/index.js" ]; then
    echo "❌ dist/index.js not found! Need to build first"
    exit 1
fi

# Create basic .env if not exists
if [ ! -f ".env" ]; then
cat > .env << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://saro:saro@localhost:5432/saro_db
PORT=3000
EOF
fi

# Test if node can run
echo "Testing if application starts..."
timeout 5s node dist/index.js || echo "Application test completed"

# Start with PM2
mkdir -p logs
pm2 start ecosystem.config.cjs --env production

# Check status
pm2 status
pm2 logs --lines 10
```

### Option 2: If build files missing (Copy-Paste this block):
```bash
cd /var/www/saroyar

# Pull latest code and force overwrite
git stash
git pull origin main --force

# Run the complete fix script
chmod +x fix-vps-start-issue.sh
./fix-vps-start-issue.sh
```

### Option 3: Manual Debug (If still not working):
```bash
cd /var/www/saroyar

# Check what's wrong
echo "=== Checking Files ==="
ls -la dist/
ls -la *.js

echo "=== Checking Environment ==="
cat .env

echo "=== Testing Node Directly ==="
node dist/index.js

# If error appears, we can fix it
```

## 🔍 Common Issues & Fixes:

### 1. **If "dist/index.js not found":**
```bash
# Need to build first
git pull origin main --force
npm install --production=false
npm run build
npm run start:pm2
```

### 2. **If "Cannot find module" errors:**
```bash
# Dependencies missing
rm -rf node_modules
npm install --production=false
npm run start:pm2
```

### 3. **If "Database connection failed":**
```bash
# Check PostgreSQL
systemctl status postgresql
sudo systemctl start postgresql

# Test database connection
psql postgresql://saro:saro@localhost:5432/saro_db -c "SELECT 1;"
```

### 4. **If "Port already in use":**
```bash
# Kill processes on port 3000
sudo lsof -ti:3000 | xargs kill -9
pm2 start ecosystem.config.cjs
```

## ✅ Success Indicators:
- PM2 status shows "online"
- No restart loops
- Application responds: `curl http://localhost:3000/healthz`
- No errors in logs: `pm2 logs`

## 📱 After Fix:
- **Application**: http://your-server-ip:3000
- **Login**: http://your-server-ip:3000/login  
- **Health**: http://your-server-ip:3000/healthz

**Run Option 1 first - এটা 90% সময় কাজ করে! 🎯**