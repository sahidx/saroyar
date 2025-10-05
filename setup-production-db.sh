#!/bin/bash

# Production Database Setup Script for VPS
# This script sets up PostgreSQL for the CoachManager application

set -e

echo "🚀 Setting up Production Database..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Database configuration
DB_NAME="saro_db"
DB_USER="saro"
DB_PASSWORD="saro_secure_2024"

echo -e "${YELLOW}📦 Installing PostgreSQL...${NC}"
sudo apt update
sudo apt install -y postgresql postgresql-contrib

echo -e "${YELLOW}🔧 Starting PostgreSQL service...${NC}"
sudo systemctl start postgresql
sudo systemctl enable postgresql

echo -e "${YELLOW}👤 Creating database user and database...${NC}"
sudo -u postgres psql -c "DROP DATABASE IF EXISTS ${DB_NAME};"
sudo -u postgres psql -c "DROP USER IF EXISTS ${DB_USER};"
sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';"
sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"

echo -e "${YELLOW}🔒 Configuring PostgreSQL authentication...${NC}"
# Update pg_hba.conf to allow password authentication
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/*/main/postgresql.conf
sudo sed -i "s/local   all             all                                     peer/local   all             all                                     md5/" /etc/postgresql/*/main/pg_hba.conf
sudo sed -i "s/host    all             all             127.0.0.1\/32            ident/host    all             all             127.0.0.1\/32            md5/" /etc/postgresql/*/main/pg_hba.conf

echo -e "${YELLOW}🔄 Restarting PostgreSQL...${NC}"
sudo systemctl restart postgresql

echo -e "${GREEN}✅ Database setup complete!${NC}"
echo -e "${GREEN}Database: ${DB_NAME}${NC}"
echo -e "${GREEN}User: ${DB_USER}${NC}"
echo -e "${GREEN}Connection: postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}${NC}"

# Test connection
echo -e "${YELLOW}🧪 Testing database connection...${NC}"
PGPASSWORD=${DB_PASSWORD} psql -h localhost -U ${DB_USER} -d ${DB_NAME} -c "SELECT version();" || {
    echo -e "${RED}❌ Database connection failed!${NC}"
    exit 1
}

echo -e "${GREEN}✅ Database connection successful!${NC}"