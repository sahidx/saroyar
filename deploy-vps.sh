#!/bin/bash

# Chemistry & ICT Care by Belal Sir - VPS Deployment Script
# This script automates the deployment process on any VPS

set -e  # Exit on any error

echo "🚀 Starting deployment of Chemistry & ICT Care by Belal Sir..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root. Consider using a non-root user for security."
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
print_status "Checking system prerequisites..."

# Check Node.js
if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ required. Current version: $(node --version)"
    exit 1
fi
print_success "Node.js $(node --version) found"

# Check npm
if ! command_exists npm; then
    print_error "npm is not installed."
    exit 1
fi
print_success "npm $(npm --version) found"

# Check PostgreSQL
if ! command_exists psql; then
    print_warning "PostgreSQL client not found. Database operations may fail."
    print_status "Install PostgreSQL with: sudo apt update && sudo apt install postgresql postgresql-contrib"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from template..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_warning "Please edit .env file with your actual configuration before continuing."
        echo "Press Enter when ready to continue..."
        read -r
    else
        print_error ".env.example file not found. Cannot create .env file."
        exit 1
    fi
fi

# Validate essential environment variables
print_status "Validating environment configuration..."

if [ -f ".env" ]; then
    source .env
    
    if [ -z "$DATABASE_URL" ]; then
        print_error "DATABASE_URL not set in .env file"
        exit 1
    fi
    
    if [ -z "$SESSION_SECRET" ]; then
        print_error "SESSION_SECRET not set in .env file"
        exit 1
    fi
    
    print_success "Environment validation passed"
else
    print_error ".env file not found"
    exit 1
fi

# Install dependencies
print_status "Installing Node.js dependencies..."
npm install
print_success "Dependencies installed"

# Database setup
print_status "Setting up database..."

# Test database connection
if psql "$DATABASE_URL" -c "SELECT 1;" >/dev/null 2>&1; then
    print_success "Database connection successful"
else
    print_error "Cannot connect to database. Please check DATABASE_URL"
    print_status "Database URL format: postgresql://username:password@host:port/database"
    exit 1
fi

# Push database schema
print_status "Pushing database schema..."
npm run db:push --force
print_success "Database schema updated"

# Build application
print_status "Building application..."
npm run build
print_success "Application built successfully"

# Create systemd service (optional)
create_systemd_service() {
    print_status "Creating systemd service..."
    
    SERVICE_NAME="chemistry-ict-care"
    SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
    
    sudo tee "$SERVICE_FILE" > /dev/null <<EOF
[Unit]
Description=Chemistry & ICT Care by Belal Sir - Educational Management System
After=network.target postgresql.service

[Service]
Type=simple
User=\$USER
WorkingDirectory=$(pwd)
Environment=NODE_ENV=production
EnvironmentFile=$(pwd)/.env
ExecStart=$(which npm) start
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=$SERVICE_NAME

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable "$SERVICE_NAME"
    
    print_success "Systemd service created: $SERVICE_NAME"
    print_status "Start with: sudo systemctl start $SERVICE_NAME"
    print_status "Check status: sudo systemctl status $SERVICE_NAME"
    print_status "View logs: sudo journalctl -u $SERVICE_NAME -f"
}

# Ask if user wants to create systemd service
echo ""
read -p "Do you want to create a systemd service for auto-startup? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    create_systemd_service
fi

# Firewall configuration
configure_firewall() {
    print_status "Configuring firewall..."
    
    if command_exists ufw; then
        sudo ufw allow 22    # SSH
        sudo ufw allow 5000  # Application port
        sudo ufw --force enable
        print_success "UFW firewall configured"
    elif command_exists firewall-cmd; then
        sudo firewall-cmd --permanent --add-port=22/tcp
        sudo firewall-cmd --permanent --add-port=5000/tcp
        sudo firewall-cmd --reload
        print_success "Firewalld configured"
    else
        print_warning "No supported firewall found. Please manually configure firewall."
    fi
}

# Ask about firewall configuration
echo ""
read -p "Do you want to configure firewall? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    configure_firewall
fi

# SSL Certificate setup reminder
print_status "SSL Certificate Setup Reminder:"
echo "  For production deployment, consider setting up SSL certificates:"
echo "  1. Using Let's Encrypt: sudo apt install certbot"
echo "  2. Using reverse proxy: nginx or apache"
echo "  3. Configure HTTPS redirect"

# Final deployment summary
echo ""
print_success "🎉 Deployment completed successfully!"
echo ""
echo "🔗 Application Details:"
echo "   • Port: 5000"
echo "   • Environment: $NODE_ENV"
echo "   • Database: Connected"
echo "   • Build: Complete"
echo ""
echo "🚀 To start the application:"
echo "   npm start"
echo ""
echo "🔍 To monitor the application:"
echo "   npm run db:info     # Database information"
echo "   tail -f logs/*.log  # Application logs"
echo ""
echo "📊 Access your application:"
echo "   http://your-server-ip:5000"
echo "   https://your-domain.com (if SSL configured)"
echo ""
print_success "Happy teaching with Chemistry & ICT Care by Belal Sir! 🧪💻"