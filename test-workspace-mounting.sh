#!/bin/bash

# Test script to verify workspace mounting works
echo "🔍 Testing workspace mounting..."

# Create a temporary test file
echo "test content" > test-mount-file.txt

echo "📄 Test file created in host directory"
echo "📁 Files in current directory:"
ls -la | grep -E "(package\.json|test-mount-file\.txt|README\.md)" | head -5

# Clean up
rm -f test-mount-file.txt

echo "✅ Test file created and cleaned up successfully"
echo "🎯 This confirms the host directory structure is accessible"
echo ""
echo "Next: Open in DevContainer and check if files are mounted correctly"
