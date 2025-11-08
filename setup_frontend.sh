#!/bin/bash

# Frontend Setup Script for Brain Tumor Detection System
# This script installs Node.js dependencies for the React frontend

echo "========================================="
echo "Brain Tumor Detection - Frontend Setup"
echo "========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed."
    echo "Please install Node.js 16 or higher from https://nodejs.org/"
    exit 1
fi

# Display Node.js version
NODE_VERSION=$(node --version)
echo "✓ Found Node.js $NODE_VERSION"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed."
    exit 1
fi

NPM_VERSION=$(npm --version)
echo "✓ Found npm $NPM_VERSION"
echo ""

# Navigate to frontend directory
cd "$(dirname "$0")/frontend" || exit

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "⚠️  node_modules directory already exists."
    read -p "Do you want to reinstall? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Removing existing node_modules..."
        rm -rf node_modules package-lock.json
    else
        echo "Skipping installation..."
        exit 0
    fi
fi

# Install dependencies
echo "Installing Node.js dependencies (this may take a few minutes)..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install dependencies."
    exit 1
fi
echo "✓ Dependencies installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    echo "VITE_API_URL=http://localhost:8000" > .env
    echo "✓ .env file created"
    echo ""
else
    echo "✓ .env file already exists"
    echo ""
fi

echo "========================================="
echo "✅ Frontend Setup Complete!"
echo "========================================="
echo ""
echo "To start the development server:"
echo "  cd frontend && npm run dev"
echo ""
echo "  The app will be available at:"
echo "  http://localhost:3000"
echo ""
echo "To build for production:"
echo "  cd frontend && npm run build"
echo ""
echo "To preview production build:"
echo "  cd frontend && npm run preview"
echo ""
