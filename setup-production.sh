#!/bin/bash

# Production Database Setup Script
# Ensures PostgreSQL is properly configured for production deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo -e "${BLUE}🚀 Production Database Setup${NC}"
echo "==============================================="

# Step 1: Check PostgreSQL installation
print_status "Checking PostgreSQL installation..."

if command -v psql >/dev/null 2>&1; then
    print_success "PostgreSQL client found"
    psql --version
else
    print_error "PostgreSQL client not found. Please install PostgreSQL first."
    print_status "Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
    print_status "CentOS/RHEL: sudo yum install postgresql postgresql-server"
    exit 1
fi

# Step 2: Check PostgreSQL service
print_status "Checking PostgreSQL service status..."

if systemctl is-active --quiet postgresql; then
    print_success "PostgreSQL service is running"
elif service postgresql status >/dev/null 2>&1; then
    print_success "PostgreSQL service is running"
else
    print_warning "PostgreSQL service may not be running. Attempting to start..."
    sudo systemctl start postgresql 2>/dev/null || sudo service postgresql start 2>/dev/null || {
        print_error "Failed to start PostgreSQL service. Please start it manually."
        exit 1
    }
fi

# Step 3: Environment Configuration
print_status "Setting up environment configuration..."

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success "Created .env from .env.example"
    else
        print_error ".env.example not found. Creating basic .env file..."
        cat > .env << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://saro:saro@localhost:5432/saro_db
PORT=3000
JWT_SECRET=production_jwt_secret_change_this
SESSION_SECRET=production_session_secret_change_this
EOF
        print_warning "Created basic .env file. Please update with secure secrets!"
    fi
else
    print_success ".env file already exists"
fi

# Step 4: Create Database and User
print_status "Setting up PostgreSQL database and user..."

# Check if running as postgres user or has sudo access
if [ "$(whoami)" = "postgres" ]; then
    PSQL_CMD="psql"
elif sudo -u postgres psql -c '\q' 2>/dev/null; then
    PSQL_CMD="sudo -u postgres psql"
else
    print_warning "Cannot run as postgres user. Trying with current user..."
    PSQL_CMD="psql -h localhost"
fi

# Create user and database
print_status "Creating database user 'saro'..."
$PSQL_CMD -c "CREATE USER saro WITH ENCRYPTED PASSWORD 'saro';" 2>/dev/null || {
    print_warning "User 'saro' may already exist"
}

print_status "Creating database 'saro_db'..."
$PSQL_CMD -c "CREATE DATABASE saro_db OWNER saro;" 2>/dev/null || {
    print_warning "Database 'saro_db' may already exist"
}

print_status "Granting privileges..."
$PSQL_CMD -c "GRANT ALL PRIVILEGES ON DATABASE saro_db TO saro;" 2>/dev/null || {
    print_warning "Privileges may already be granted"
}

# Test connection
print_status "Testing database connection..."
if psql -h localhost -U saro -d saro_db -c "SELECT 1;" >/dev/null 2>&1; then
    print_success "Database connection successful"
else
    print_error "Database connection failed. Please check your PostgreSQL configuration."
    print_status "Try: sudo -u postgres psql -c \"ALTER USER saro WITH PASSWORD 'saro';\""
fi

# Step 5: Install Dependencies
print_status "Installing production dependencies..."
if npm install --production=false; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Step 6: Run Database Migrations
print_status "Running database migrations..."
if npm run db:generate; then
    print_success "Database schema generated"
else
    print_warning "Schema generation failed or not needed"
fi

if npm run db:migrate; then
    print_success "Database migrations completed"
else
    print_warning "Migrations failed or not needed"
fi

# Step 7: Build Application
print_status "Building application for production..."
if npm run build; then
    print_success "Application built successfully"
    
    # Show build output sizes
    if [ -d "server/public" ]; then
        FRONTEND_SIZE=$(du -sh server/public | cut -f1)
        print_status "Frontend bundle size: $FRONTEND_SIZE"
    fi
    
    if [ -f "dist/index.js" ]; then
        BACKEND_SIZE=$(du -sh dist/index.js | cut -f1)
        print_status "Backend bundle size: $BACKEND_SIZE"
    fi
else
    print_error "Application build failed"
    exit 1
fi

# Step 8: Final Configuration Check
print_status "Performing final configuration checks..."

# Check essential files
REQUIRED_FILES=("dist/index.js" "server/public/index.html" ".env")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "✓ $file exists"
    else
        print_error "✗ $file missing"
        exit 1
    fi
done

# Generate secure secrets if using defaults
if grep -q "production_jwt_secret_change_this" .env; then
    print_warning "⚠️  Please update JWT_SECRET in .env with a secure value"
fi

if grep -q "production_session_secret_change_this" .env; then
    print_warning "⚠️  Please update SESSION_SECRET in .env with a secure value"
fi

echo ""
echo "==============================================="
print_success "🎉 Production setup completed successfully!"
echo ""
print_status "Next steps:"
echo "  1. Update secrets in .env file"
echo "  2. Configure nginx reverse proxy (optional)"
echo "  3. Set up SSL certificate"
echo "  4. Start the application:"
echo "     npm run start:pm2"
echo ""
print_status "Application URLs:"
echo "  • Main App: http://localhost:3000"
echo "  • Health Check: http://localhost:3000/healthz"
echo ""
print_warning "Remember to:"
echo "  • Set up regular database backups"
echo "  • Configure firewall rules"
echo "  • Monitor application logs: pm2 logs"
echo "  • Update environment secrets for security"