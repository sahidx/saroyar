#!/bin/bash

# Clean Production Build Script
# Removes all SQLite dependencies and prepares for PostgreSQL-only production

set -e

echo "🧹 Cleaning SQLite dependencies for production..."

# Remove SQLite-related files
echo "📁 Removing SQLite files..."
find . -name "*.sqlite*" -type f -delete 2>/dev/null || true
rm -f add-teacher.js add-test-data.js add-admin-accounts.cjs 2>/dev/null || true
rm -f seed-sqlite.js init-sqlite.js check-sqlite-schema.js 2>/dev/null || true
rm -f test-direct-exam-creation.js 2>/dev/null || true

# Clean package-lock.json (will be regenerated)
echo "📦 Cleaning package-lock.json..."
rm -f package-lock.json

# Install only production dependencies
echo "📦 Installing production dependencies..."
npm install --production

# Remove development SQLite dependencies from node_modules
echo "🗑️ Removing SQLite modules..."
rm -rf node_modules/better-sqlite3 2>/dev/null || true
rm -rf node_modules/sqlite3 2>/dev/null || true
rm -rf node_modules/connect-sqlite3 2>/dev/null || true
rm -rf node_modules/@types/better-sqlite3 2>/dev/null || true
rm -rf node_modules/@types/connect-sqlite3 2>/dev/null || true

# Reinstall with only PostgreSQL dependencies
echo "📦 Reinstalling with PostgreSQL only..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

echo "✅ Production cleanup completed!"
echo "🎯 Ready for PostgreSQL-only deployment"