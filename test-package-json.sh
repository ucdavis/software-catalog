#!/bin/bash

# Test script to verify package.json exists
echo "🔍 Testing package.json accessibility..."
# Fail on first error, undefined var, or a pipe failure
set -euo pipefail

if [ -f "package.json" ]; then
    echo "✅ package.json found in current directory"
    project_name=$(grep -m1 '"name"' package.json | awk -F'"' '{print $4}')
    echo "📦 Project name: ${project_name:-<unknown>}"
    echo "📄 Current directory: $(pwd)"
    echo "📁 Files in current directory:"
    ls -la | head -10
else
    echo "❌ package.json not found in current directory"
    echo "📄 Current directory: $(pwd)"
    echo "📁 Files in current directory:"
    ls -la
fi
