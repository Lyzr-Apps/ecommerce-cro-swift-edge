#!/bin/bash

# Aimpler - Cloudflare Pages Deployment Script
# Deploy to www.aimpler.com

echo "======================================"
echo "Aimpler - Cloudflare Deployment"
echo "======================================"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null
then
    echo "Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Build the application
echo "Building application..."
npm install
npm run build

if [ $? -ne 0 ]; then
    echo "Build failed. Exiting..."
    exit 1
fi

echo ""
echo "Build successful!"
echo ""

# Deploy to Cloudflare Pages
echo "Deploying to Cloudflare Pages..."
wrangler pages deploy dist --project-name=aimpler

if [ $? -eq 0 ]; then
    echo ""
    echo "======================================"
    echo "Deployment successful!"
    echo "======================================"
    echo ""
    echo "Your app is now live at:"
    echo "https://aimpler.pages.dev"
    echo ""
    echo "To set up custom domain (www.aimpler.com):"
    echo "1. Go to Cloudflare Pages dashboard"
    echo "2. Select your 'aimpler' project"
    echo "3. Click 'Custom domains' tab"
    echo "4. Add 'www.aimpler.com'"
    echo ""
    echo "Environment variables:"
    echo "Add these in Cloudflare dashboard under Settings > Environment variables:"
    echo "  VITE_AGENT_API_URL = <your-api-url>"
    echo "  VITE_AGENT_ID = 69797ab1a5d355f8aa48876f"
    echo ""
else
    echo ""
    echo "Deployment failed. Please check the error above."
    exit 1
fi
