#!/bin/bash

set -euo pipefail

echo "🔐 Generating AUTH_SECRET for .env file..."

# Generate the auth secret (this creates .env.local)
npx auth secret

# Check if .env.local was created and contains AUTH_SECRET
if [ -f ".env.local" ] && grep -q "AUTH_SECRET=" ".env.local"; then
    echo "✅ AUTH_SECRET generated in .env.local"
    
    # Extract the AUTH_SECRET value from .env.local
    AUTH_SECRET_VALUE=$(grep "AUTH_SECRET=" .env.local | cut -d'=' -f2)
    
    # Remove AUTH_SECRET from .env if it exists
    if [ -f ".env" ]; then
        # Create temporary file without AUTH_SECRET line
        grep -v "^AUTH_SECRET=" .env > .env.tmp || true
        mv .env.tmp .env
    fi
    
    # Add the AUTH_SECRET to .env
    echo "AUTH_SECRET=$AUTH_SECRET_VALUE" >> .env
    
    # Remove .env.local since we moved the secret to .env
    rm .env.local
    
    echo "✅ AUTH_SECRET moved to .env file"
    echo "🗑️  Removed .env.local file"
else
    echo "❌ Failed to generate AUTH_SECRET"
    exit 1
fi

echo "🎉 AUTH_SECRET successfully configured in .env!"
