#!/bin/bash

# Database helper script for devcontainer development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables from .env file
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | grep -v '^$' | xargs)
fi

# Database connection details (from .env or defaults)
DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-software_catalog_dev}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"

# Function to print usage
usage() {
    echo "Usage: $0 [reset|migrate|studio|status|connect|help]"
    echo ""
    echo "Commands:"
    echo "  reset     - Reset the database (drop and recreate)"
    echo "  migrate   - Run Prisma migrations"
    echo "  studio    - Open Prisma Studio"
    echo "  status    - Check database connection status"
    echo "  connect   - Connect to database with psql"
    echo "  help      - Show this help message"
}

# Function to check database connection
check_db_connection() {
    echo -e "${YELLOW}Checking database connection...${NC}"
    if pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Database is ready${NC}"
        return 0
    else
        echo -e "${RED}❌ Database is not ready${NC}"
        return 1
    fi
}

# Function to reset database
reset_db() {
    echo -e "${YELLOW}Resetting database...${NC}"
    if check_db_connection; then
        echo -e "${YELLOW}Running Prisma reset...${NC}"
        npx prisma migrate reset --force
        echo -e "${GREEN}✅ Database reset completed${NC}"
    else
        echo -e "${RED}❌ Cannot reset database - connection failed${NC}"
        exit 1
    fi
}

# Function to run migrations
migrate_db() {
    echo -e "${YELLOW}Running database migrations...${NC}"
    if check_db_connection; then
        npx prisma migrate dev
        echo -e "${GREEN}✅ Migrations completed${NC}"
    else
        echo -e "${RED}❌ Cannot run migrations - connection failed${NC}"
        exit 1
    fi
}

# Function to open Prisma Studio
open_studio() {
    echo -e "${YELLOW}Opening Prisma Studio...${NC}"
    if check_db_connection; then
        npx prisma studio
    else
        echo -e "${RED}❌ Cannot open Prisma Studio - connection failed${NC}"
        exit 1
    fi
}

# Function to connect to database
connect_db() {
    echo -e "${YELLOW}Connecting to database...${NC}"
    if check_db_connection; then
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"
    else
        echo -e "${RED}❌ Cannot connect to database${NC}"
        exit 1
    fi
}

# Main script logic
case "$1" in
    "reset")
        reset_db
        ;;
    "migrate")
        migrate_db
        ;;
    "studio")
        open_studio
        ;;
    "status")
        check_db_connection
        ;;
    "connect")
        connect_db
        ;;
    "help"|"-h"|"--help")
        usage
        ;;
    *)
        echo -e "${RED}Invalid command: $1${NC}"
        usage
        exit 1
        ;;
esac
