# VPS Deployment Fix Guide

## The Issue
The build was failing because Vite and other build tools were in `devDependencies` but production environments typically don't install these packages.

## Quick Fix for Current VPS Deployment

### Option 1: Pull Latest Changes (Recommended)
```bash
# On your VPS, navigate to your project directory
cd /var/www/saroyar

# Pull the latest changes with fixed dependencies
git pull origin main

# Install ALL dependencies (including dev dependencies for building)
npm install --production=false

# Build the project
npm run build

# Start with PM2
npm run start:pm2
```

### Option 2: Manual Fix on VPS
If you can't pull changes, fix it manually on your VPS:

```bash
# Install all dependencies including dev dependencies
npm install --production=false

# Build the project
npm run build:frontend
npm run build:backend

# Start the application
npm run start:pm2
```

## What Was Fixed

### 1. Moved Essential Build Tools to Dependencies
- `vite`: ^5.4.19
- `@vitejs/plugin-react`: ^4.3.2
- `esbuild`: ^0.25.0
- `typescript`: 5.6.3
- `tsx`: ^4.19.1
- `cross-env`: ^10.0.0
- `autoprefixer`: ^10.4.20
- `postcss`: ^8.4.47
- `tailwindcss`: ^3.4.17

### 2. Updated Package.json Scripts
Added production-specific scripts:
- `production:install`: Install all dependencies including dev
- `production:build`: Install and build in one step  
- `production:deploy`: Complete production deployment

### 3. Fixed Ecosystem Config
Updated PM2 deployment configuration to:
- Use correct path: `/var/www/saroyar`
- Install all dependencies: `npm install --production=false`
- Proper build sequence

## Deployment Commands for VPS

### Full Deployment Process
```bash
# 1. Clone or pull latest code
git clone https://github.com/sahidx/saroyar.git
# OR if already cloned:
git pull origin main

# 2. Install dependencies (including build tools)
npm install --production=false

# 3. Set up environment
cp .env.example .env
# Edit .env with your production values

# 4. Build application
npm run build

# 5. Start with PM2
npm run start:pm2
```

### Environment Setup
Make sure your `.env` file has:
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@localhost:5432/your_db
PORT=3000
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-session-secret-key
```

## Verification
After deployment, verify:
1. Frontend builds to `server/public/`
2. Backend builds to `dist/index.js`
3. PM2 shows running process: `pm2 status`
4. Application accessible on configured port

## Troubleshooting
If you still get build errors:
1. Clear npm cache: `npm cache clean --force`
2. Delete node_modules: `rm -rf node_modules`
3. Reinstall: `npm install --production=false`
4. Rebuild: `npm run build`

## Production Checklist
- ✅ PostgreSQL running and accessible
- ✅ Environment variables configured
- ✅ All dependencies installed (with --production=false)
- ✅ Application built successfully
- ✅ PM2 process running
- ✅ Nginx configured (if using reverse proxy)
- ✅ SSL certificate configured (if using HTTPS)