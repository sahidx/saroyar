# 🔧 VPS Database Troubleshooting Guide

## 🚨 Common Issues & Solutions

### ❌ **Error: "role 'root' does not exist"**

**Cause:** PostgreSQL is trying to connect with system user instead of DATABASE_URL

**Solution:**
```bash
# 1. Set DATABASE_URL properly
export DATABASE_URL='postgresql://username:password@host:5432/database'

# 2. Run our setup script
npm run vps:setup
```

### ❌ **Error: "column 'class_time' does not exist"**

**Cause:** Database schema not properly migrated

**Solution:**
```bash
# 1. Force schema synchronization
npx drizzle-kit push --force

# 2. Or use our setup script
npm run vps:setup
```

### ❌ **Error: "invalid input syntax for type uuid"**

**Cause:** Seed data contains string IDs instead of UUIDs

**Solution:**
```bash
# Fix UUID format in database
npm run db:fix-uuids
```

### ❌ **Migration Failures**

**Cause:** Various migration issues

**Solution:**
```bash
# Complete database setup
npm run vps:setup
```

## ✅ **VPS Production Setup Steps**

### 1. **Environment Setup**
```bash
# Set environment variables
export DATABASE_URL='postgresql://username:password@host:5432/database'
export SESSION_SECRET='your-64-character-secret'
export NODE_ENV='production'
```

### 2. **Database Setup**
```bash
# Run complete database setup
npm run vps:setup
```

### 3. **Build & Deploy**
```bash
# Deploy application
npm run vps:deploy
```

## 🔍 **Manual Debugging**

### Check Database Connection
```bash
# Test connection
psql "$DATABASE_URL" -c "SELECT version();"
```

### Check Schema
```bash
# List tables
psql "$DATABASE_URL" -c "\dt"

# Check specific table structure
psql "$DATABASE_URL" -c "\d users"
psql "$DATABASE_URL" -c "\d batches"
```

### Check Data
```bash
# Check for invalid UUIDs
psql "$DATABASE_URL" -c "
SELECT id, first_name, last_name 
FROM users 
WHERE id NOT SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
"
```

## 📋 **Schema Requirements**

### Users Table (snake_case in DB, camelCase in TypeScript)
```sql
CREATE TABLE users (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name varchar,        -- users.firstName in TypeScript
  last_name varchar,         -- users.lastName in TypeScript
  role user_role,
  batch_id varchar,          -- users.batchId in TypeScript
  -- ... other fields
);
```

### Batches Table
```sql
CREATE TABLE batches (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar NOT NULL,
  class_time varchar,        -- batches.classTime in TypeScript
  subject subject NOT NULL,
  -- ... other fields
);
```

## 🎯 **Production Checklist**

- [ ] DATABASE_URL properly set
- [ ] Migrations applied successfully
- [ ] Schema synchronized (snake_case in DB)
- [ ] UUID formats validated
- [ ] All essential tables exist
- [ ] Seed data cleaned up
- [ ] Application starts without errors

## 🆘 **Emergency Reset**

If everything fails, complete database reset:

```bash
# 1. Drop and recreate database (DANGER!)
psql "$DATABASE_URL" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# 2. Run complete setup
npm run vps:setup

# 3. Restart application
pm2 restart all
```

⚠️ **WARNING:** Emergency reset will delete ALL data!

## 📞 **Support**

If issues persist:
1. Check the setup logs carefully
2. Verify DATABASE_URL format
3. Ensure PostgreSQL server is running
4. Check network connectivity
5. Verify user permissions on database

The `setup-vps-database.sh` script handles most common issues automatically!