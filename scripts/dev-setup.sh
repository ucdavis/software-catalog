#!/bin/bash

# Development setup script for software-catalog

set -eo pipefail

# Change to the project root directory
cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)
# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Software Catalog - Development Setup${NC}"
echo "========================================"

# Function to print usage
usage() {
    echo "Usage: $0 [dev|prod|clean|help]"
    echo ""
    echo "Commands:"
    echo "  dev     - Start development environment"
    echo "  prod    - Start production environment"
    echo "  clean   - Clean up containers and volumes"
    echo "  help    - Show this help message"
}

# Function to start development environment
start_dev() {
    echo -e "${YELLOW}Starting development environment...${NC}"
    
    # Check if .env exists
if [ ! -f ".env" ]; then
        echo -e "${RED}Warning: .env file not found!${NC}"
        echo "Please create a .env file based on .env.example"
        if [[ "${FORCE_COPY_ENV:-false}" == "true" ]]; then
            response="y"
        else
            echo "Would you like to copy .env.example to .env? (y/n)"
            read -r response
        fi
        if [ "$response" = "y" ]; then
cp .env.example .env
            echo -e "${GREEN}.env file created from .env.example${NC}"
            echo -e "${YELLOW}Please edit .env with your database URL and other settings${NC}"
        fi
    fi
    
    # Start development container
    docker compose up --build app-dev
}

# Function to start production environment
start_prod() {
    echo -e "${YELLOW}Starting production environment...${NC}"
    docker compose up --build app
}

clean_up() {
    echo -e "${YELLOW}Cleaning up containers and volumes...${NC}"
    docker compose down --volumes --remove-orphans
    echo -e "${YELLOW}Running 'docker system prune' will remove ALL dangling images, volumes and build cache.${NC}"
    read -rp "Continue? (y/N) " ans
    if [[ "${ans}" =~ ^[Yy]$ ]]; then
        docker system prune -f
    else
        echo "Skipped system prune"
    fi
    echo -e "${GREEN}Cleanup completed${NC}"
}

# Main script logic
case "$1" in
    "dev")
        start_dev
        ;;
    "prod")
        start_prod
        ;;
    "clean")
        clean_up
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
