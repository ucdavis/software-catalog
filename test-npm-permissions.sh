#!/bin/bash
set -euo pipefail

# Test script to check npm install permissions
echo "🔍 Testing npm install permissions..."
# Check if we can create a test directory in the current location
echo "📁 Testing directory creation permissions..."
tmpdir=$(mktemp -d 2>/dev/null)
trap 'rm -rf "${tmpdir}"' EXIT
if [[ -d "${tmpdir}" ]]; then
    echo "✅ Can create directories in current location"
else
    echo "❌ Cannot create directories in current location"
    exit 1
fi

# Check if node_modules directory exists and permissions
if [ -d "node_modules" ]; then
    echo "📦 node_modules directory exists"
    echo "🔒 Permissions: $(ls -ld node_modules)"
    
    if touch node_modules/test-write 2>/dev/null; then
        echo "✅ Can write to node_modules"
        rm -f node_modules/test-write
    else
        echo "❌ Cannot write to node_modules"
        echo "👤 Current user: $(whoami)"
        echo "🔒 node_modules owner: $(ls -ld node_modules | awk '{print $3\":\"$4}')"
        exit 1
    fi
else
    echo "📦 node_modules directory does not exist (this is normal for fresh setup)"
fi

# Check npm cache permissions
echo "📦 Testing npm cache permissions..."
if npm config get cache >/dev/null 2>&1; then
    echo "✅ npm cache accessible"
    echo "📂 npm cache location: $(npm config get cache)"
else
    echo "❌ npm cache not accessible"
fi

echo "🎯 Permission test complete"
