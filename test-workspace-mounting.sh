#!/bin/bash

# Test script to verify workspace mounting works
echo "🔍 Testing workspace mounting..."

set -euo pipefail

# Create a temporary test file
tmp_file="test-mount-file.txt"
echo "test content" > "$tmp_file"

echo "📄 Test file created in host directory"
echo "📁 Files in current directory:"
ls -la package.json "$tmp_file" README.md 2>/dev/null | head -5

# Clean up
rm -f test-mount-file.txt

echo "✅ Test file created and cleaned up successfully"
echo "🎯 This confirms the host directory structure is accessible"
echo ""
echo "Next: Open in DevContainer and check if files are mounted correctly"
