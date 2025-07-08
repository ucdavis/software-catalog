#!/bin/bash

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

if [ ! -f ".devcontainer/Dockerfile" ]; then
    echo "❌ .devcontainer/Dockerfile not found"
    exit 1
fi

echo "✅ DevContainer configuration files found"

# Test building the DevContainer
echo "🔨 Testing DevContainer build..."
cd .devcontainer
if docker build -t devcontainer-test . > /dev/null 2>&1; then
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
