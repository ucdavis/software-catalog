# Scripts Directory

This directory contains various shell scripts for managing the software-catalog project. All scripts are designed to be run from anywhere in the project and will automatically change to the project root directory.

## Available Scripts

### Development Setup
- **`dev-setup.sh`** - Main development setup script
  - `dev-setup.sh dev` - Start development environment
  - `dev-setup.sh prod` - Start production environment
  - `dev-setup.sh clean` - Clean up containers and volumes
  - `dev-setup.sh help` - Show help message

### Database Management
- **`start-database.sh`** - Start a PostgreSQL database container for local development

### Authentication
- **`generate-auth-secret.sh`** - Generate AUTH_SECRET for .env file

### DevContainer Support
- **`setup-devcontainer.sh`** - Assist with DevContainer setup
- **`validate-devcontainer.sh`** - Validate DevContainer configuration

### Testing & Validation
- **`test-package-json.sh`** - Test package.json accessibility
- **`test-npm-permissions.sh`** - Test npm install permissions
- **`test-workspace-mounting.sh`** - Test workspace mounting for DevContainer

## Usage

### Via npm scripts (Recommended)

All scripts are now available as npm scripts for easier usage:

```bash
# Development setup
npm run dev:setup          # Start development environment
npm run dev:setup:prod     # Start production environment
npm run dev:setup:clean    # Clean up containers and volumes
npm run dev:setup:help     # Show help message

# Database management
npm run db:start           # Start database container

# Authentication
npm run generate:auth-secret # Generate AUTH_SECRET for .env

# DevContainer support
npm run devcontainer:setup     # Setup DevContainer
npm run devcontainer:validate  # Validate DevContainer

# Testing & validation
npm run test:package-json       # Test package.json accessibility
npm run test:npm-permissions    # Test npm permissions
npm run test:workspace-mounting # Test workspace mounting
```

### Direct script execution

Scripts can also be run directly from the project root directory:

```bash
# From project root
./scripts/dev-setup.sh dev
./scripts/start-database.sh
./scripts/test-package-json.sh
```

Or from any subdirectory:

```bash
# From any subdirectory
../scripts/dev-setup.sh dev
../../scripts/start-database.sh
```

The scripts will automatically change to the project root directory and reference all files correctly.
