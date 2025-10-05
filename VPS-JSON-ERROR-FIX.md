# 🚨 VPS JSON ERROR FIX - URGENT

**আপনার VPS-এ `package.json` ফাইলে Bengali comment এর কারণে JSON syntax error হচ্ছে।**

## 🔥 তুরন্ত সমাধান (VPS-এ রান করুন):

### Option 1: Auto Fix Script (Recommended)
```bash
# ১. প্রজেক্ট ডিরেক্টরিতে যান
cd /var/www/saroyar

# ২. লেটেস্ট কোড নিন
git pull origin main

# ৩. Fix script রান করুন
chmod +x fix-vps-json-error.sh
./fix-vps-json-error.sh
```

### Option 2: Manual Fix
```bash
# ১. প্রজেক্ট ডিরেক্টরিতে যান
cd /var/www/saroyar

# ২. PM2 বন্ধ করুন
pm2 stop all

# ৩. package.json backup করুন
cp package.json package.json.backup

# ৪. নতুন clean package.json তৈরি করুন
cat > package.json << 'EOF'
{
  "name": "rest-express",
  "version": "1.0.0",
  "type": "module",
  "license": "MIT",
  "scripts": {
    "dev": "cross-env NODE_ENV=development tsx server/index.ts",
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "vite build",
    "build:backend": "esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --minify --resolve-extensions=.ts,.js --alias:@shared=shared",
    "start": "cross-env NODE_ENV=production node dist/index.js",
    "start:pm2": "pm2 start ecosystem.config.cjs",
    "stop:pm2": "pm2 stop ecosystem.config.cjs",
    "restart:pm2": "pm2 restart ecosystem.config.cjs",
    "production": "npm run build && npm run start"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^4.3.2",
    "autoprefixer": "^10.4.20",
    "cross-env": "^10.0.0",
    "esbuild": "^0.25.0",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.17",
    "tsx": "^4.19.1",
    "typescript": "5.6.3",
    "vite": "^5.4.19",
    "express": "^4.21.2",
    "drizzle-orm": "^0.39.1",
    "pg": "^8.16.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "dotenv": "^17.2.2"
  },
  "devDependencies": {
    "@types/node": "20.16.11",
    "@types/express": "4.17.21",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "drizzle-kit": "^0.31.4"
  }
}
EOF

# ৫. JSON validate করুন
node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8')); console.log('✅ JSON is valid')"

# ৬. Dependencies install করুন
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --production=false

# ৭. Build করুন
npm run build

# ৮. PM2 দিয়ে start করুন
npm run start:pm2

# ৯. Status check করুন
pm2 status
```

## 🔍 সমস্যার কারণ:
- VPS-এর package.json ফাইলে Bengali comment (// তোমার dependency) আছে
- JSON ফাইলে comment allow করা হয় না
- Position 1357-তে syntax error হচ্ছে

## ✅ সমাধান:
- Clean JSON ফাইল তৈরি করা হয়েছে
- সব dependencies ঠিক রাখা হয়েছে  
- Build tools (vite, esbuild, tsx) dependencies-তে move করা হয়েছে

## 🎯 Fix এর পর Check করুন:
```bash
# PM2 status
pm2 status

# Application logs
pm2 logs coach-manager-production

# Test application
curl http://localhost:3000/healthz

# Test login
curl -X POST -H "Content-Type: application/json" \
  -d '{"phoneNumber":"01762602056","password":"sir@123@"}' \
  http://localhost:3000/api/auth/login
```

## 📱 Application URLs:
- **Main App**: http://your-server-ip:3000
- **Login**: http://your-server-ip:3000/login
- **Health Check**: http://your-server-ip:3000/healthz

---

**এই fix script run করার পর আপনার application সম্পূর্ণ কাজ করবে!** 🎉