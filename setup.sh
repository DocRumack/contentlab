#!/bin/bash

echo "🚀 Content Creation Lab - Setup Script"
echo "======================================"
echo ""

# Check if node is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null
then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm found: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Create necessary directories
echo ""
echo "📁 Creating directories..."
mkdir -p automation/screenshots
mkdir -p automation/outputs
mkdir -p automation/logs

# Success message
echo ""
echo "✨ Setup complete!"
echo ""
echo "To start the Content Lab:"
echo "  npm run dev"
echo ""
echo "To run in headless mode:"
echo "  npm run headless"
echo ""
echo "To start the API server:"
echo "  npm run api"
echo ""
echo "The lab will be available at: http://localhost:3002"
