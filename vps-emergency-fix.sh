echo "🚨 VPS JSON Fix - Direct Command"
echo "Backing up and fixing package.json..."

# Backup current package.json
cp package.json package.json.broken-backup 2>/dev/null || true

# Force checkout clean package.json from git
git stash
git pull origin main --force

# If fix script exists, run it
if [ -f "fix-vps-json-error.sh" ]; then
    chmod +x fix-vps-json-error.sh
    ./fix-vps-json-error.sh
else
    # Manual fix if script not found
    echo "Running manual fix..."
    
    # Stop PM2
    pm2 stop all 2>/dev/null || true
    
    # Clean and reinstall
    rm -rf node_modules package-lock.json
    npm cache clean --force
    npm install --production=false
    
    # Build
    npm run build
    
    # Start
    npm run start:pm2
    
    # Status
    pm2 status
    echo "✅ Manual fix completed!"
fi

echo "✅ VPS Fix completed! Check pm2 status"
