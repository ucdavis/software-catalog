#!/bin/bash

set -euo pipefail

# Change to the project root directory
cd "$(dirname "$0")/.."

# Script to validate DevContainer setup

echo "🔍 Validating DevContainer setup..."


# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running"
    exit 1
fi

echo "✅ Docker is running"

# Check if devcontainer files exist
if [ ! -f ".devcontainer/devcontainer.json" ]; then
    echo "❌ .devcontainer/devcontainer.json not found"
    exit 1
fi

if [ ! -f "Dockerfile" ]; then
    echo "❌ Dockerfile not found in root directory"
    exit 1
fi

echo "✅ DevContainer configuration files found"

# Test building the DevContainer using the root Dockerfile with development target
echo "🔨 Testing DevContainer build..."
if docker build -t devcontainer-test --target development . > /dev/null 2>&1; then
    echo "✅ DevContainer builds successfully"
    
    # Test basic functionality
    echo "🧪 Testing container functionality..."
    if docker run --rm devcontainer-test node --version > /dev/null 2>&1; then
        echo "✅ Node.js is working"
    else
        echo "❌ Node.js is not working"
        exit 1
    fi
    
    if docker run --rm devcontainer-test npm --version > /dev/null 2>&1; then
        echo "✅ npm is working"
    else
        echo "❌ npm is not working"
        exit 1
    fi
    
    # Test dev-specific tools
    if docker run --rm devcontainer-test tsc --version > /dev/null 2>&1; then
        echo "✅ TypeScript is working"
    else
        echo "❌ TypeScript is not working"
        exit 1
    fi
    
    if docker run --rm devcontainer-test prisma --version > /dev/null 2>&1; then
        echo "✅ Prisma CLI is working"
    else
        echo "❌ Prisma CLI is not working"
        exit 1
    fi
    
    # Test that development dependencies are installed
    if docker run --rm devcontainer-test sh -c "npm list typescript" > /dev/null 2>&1; then
        echo "✅ Development dependencies are installed"
    else
        echo "❌ Development dependencies are missing"
        exit 1
    fi
    
    # Clean up
    docker rmi devcontainer-test > /dev/null 2>&1
    
else
    echo "❌ DevContainer build failed"
    exit 1
fi

echo "🎉 DevContainer setup is valid!"
echo ""
echo "Next steps:"
echo "1. Open VS Code in this directory"
echo "2. Press Ctrl+Shift+P (or Cmd+Shift+P on Mac)"
echo "3. Type 'Dev Containers: Reopen in Container'"
echo "4. Select the option and wait for the container to build"
