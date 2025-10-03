# 🚀 VPS Deployment Guide - Environment & Migration Fix

## 🔧 **Root Problem Solution**

Your issues were caused by:
1. **DATABASE_URL not persisting** across sessions/PM2
2. **Migration scripts** falling back to `root` user
3. **Schema mismatch** between expected columns and actual database

## ✅ **Complete Fix - Step by Step**

### **Step 1: Clone & Setup**
```bash
# On your VPS
git pull origin main

# Install dependencies
npm install
```

### **Step 2: Setup Persistent Environment**
```bash
# This creates .env, updates .bashrc, and configures PM2
npm run vps:env-setup
```

This script will:
- ✅ Create `.env` file with DATABASE_URL
- ✅ Add environment variables to `.bashrc` (persistent across sessions)  
- ✅ Create `ecosystem.config.js` with environment for PM2
- ✅ Test database connection

### **Step 3: Run Database Migrations**
```bash
# Source the new environment
source ~/.bashrc

# Run migrations with proper environment handling
npm run db:migrate-safe
```

This will:
- ✅ Load DATABASE_URL from multiple sources (.env, .bashrc)
- ✅ Test connection before running migrations
- ✅ Apply schema with proper snake_case columns (first_name, last_name, class_time)
- ✅ Verify all essential tables exist

### **Step 4: Fix UUID Format Issues**
```bash
# Fix any invalid UUID strings in database
npm run db:fix-uuids
```

### **Step 5: Build & Deploy**
```bash
# Complete deployment
npm run vps:deploy
```

## 🔍 **Verification Commands**

### Check Environment Variables:
```bash
echo $DATABASE_URL
# Should show: postgresql://saro:saro@localhost:5432/saro_db
```

### Check Database Schema:
```bash
# Test connection
psql "$DATABASE_URL" -c "SELECT version();"

# Check users table has snake_case columns
psql "$DATABASE_URL" -c "\d users"
# Should show: first_name, last_name

# Check batches table has class_time
psql "$DATABASE_URL" -c "\d batches"  
# Should show: class_time column
```

### Check PM2 Environment:
```bash
pm2 show saroyar
# Should show DATABASE_URL in environment variables
```

## 🎯 **One-Command Setup**

For complete setup from scratch:
```bash
npm run db:setup-complete
```

This runs:
1. Environment setup (persistent variables)
2. Database migrations (with proper environment)
3. Schema verification

## 🆘 **Troubleshooting**

### If DATABASE_URL is still not found:
```bash
# Manual setup
export DATABASE_URL="postgresql://saro:saro@localhost:5432/saro_db"
echo 'export DATABASE_URL="postgresql://saro:saro@localhost:5432/saro_db"' >> ~/.bashrc
source ~/.bashrc
```

### If migrations still fail:
```bash
# Force schema push
DATABASE_URL="postgresql://saro:saro@localhost:5432/saro_db" npx drizzle-kit push --force
```

### If PM2 can't find environment:
```bash
# Restart PM2 with new config
pm2 delete all
npm run vps:deploy
```

## 📋 **Key Files Created/Modified**

- ✅ `.env` - Environment variables for Node.js
- ✅ `~/.bashrc` - Persistent shell environment  
- ✅ `ecosystem.config.js` - PM2 configuration with environment
- ✅ `run-migrations.sh` - Safe migration script
- ✅ `setup-vps-environment.sh` - Complete environment setup

## 🎉 **Expected Results**

After running the setup:
- ✅ DATABASE_URL persists across all sessions
- ✅ Migrations use correct database connection
- ✅ Schema has proper snake_case columns
- ✅ Batch creation works without errors
- ✅ PM2 processes have access to environment variables

Your VPS deployment should now work perfectly! 🚀