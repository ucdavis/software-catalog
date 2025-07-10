#!/bin/bash

set -euo pipefail

echo "🔐 Generating AUTH_SECRET for .env file..."

# Generate the auth secret (this creates .env.local)
npx auth secret

# Check if .env.local was created and contains AUTH_SECRET
if [ -f ".env.local" ] && grep -q "AUTH_SECRET=" ".env.local"; then
    echo "✅ AUTH_SECRET generated in .env.local"
    
    # Extract the AUTH_SECRET value from .env.local (removing any quotes)
    AUTH_SECRET_VALUE=$(grep "AUTH_SECRET=" .env.local | cut -d'=' -f2- | sed 's/^["'\'']*//;s/["'\'']*$//')
    
    # Remove AUTH_SECRET from .env if it exists
    if [ -f ".env" ]; then
        # Use sed to remove the AUTH_SECRET line in place
        sed '/^AUTH_SECRET=/d' .env > .env.tmp && mv .env.tmp .env
    fi
    
    # Add the AUTH_SECRET to .env with proper quotes
    printf 'AUTH_SECRET="%s"\n' "$AUTH_SECRET_VALUE" >> .env
    
    # Remove .env.local since we moved the secret to .env
    rm .env.local
    
    echo "✅ AUTH_SECRET moved to .env file"
    echo "🗑️  Removed .env.local file"
else
    echo "❌ Failed to generate AUTH_SECRET"
    exit 1
fi

echo "🎉 AUTH_SECRET successfully configured in .env!"
