#!/bin/bash

# Test script to verify package.json exists
echo "🔍 Testing package.json accessibility..."

if [ -f "package.json" ]; then
    echo "✅ package.json found in current directory"
    echo "📦 Project name: $(cat package.json | grep '"name"' | head -1 | awk -F'"' '{print $4}')"
    echo "📄 Current directory: $(pwd)"
    echo "📁 Files in current directory:"
    ls -la | head -10
else
    echo "❌ package.json not found in current directory"
    echo "📄 Current directory: $(pwd)"
    echo "📁 Files in current directory:"
    ls -la
fi
