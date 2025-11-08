#!/bin/bash

# Backend Setup Script for Brain Tumor Detection System
# This script sets up a Python virtual environment and installs all dependencies

echo "========================================="
echo "Brain Tumor Detection - Backend Setup"
echo "========================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed."
    echo "Please install Python 3.8 or higher from https://www.python.org/"
    exit 1
fi

# Display Python version
PYTHON_VERSION=$(python3 --version)
echo "✓ Found $PYTHON_VERSION"
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/backend" || exit

# Check if virtual environment already exists
if [ -d "venv" ]; then
    echo "⚠️  Virtual environment already exists."
    read -p "Do you want to recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Removing existing virtual environment..."
        rm -rf venv
    else
        echo "Using existing virtual environment..."
    fi
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    
    if [ $? -ne 0 ]; then
        echo "❌ Error: Failed to create virtual environment."
        exit 1
    fi
    echo "✓ Virtual environment created"
    echo ""
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to activate virtual environment."
    exit 1
fi
echo "✓ Virtual environment activated"
echo ""

# Upgrade pip
echo "Upgrading pip..."
python -m pip install --upgrade pip --quiet

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to upgrade pip."
    exit 1
fi
echo "✓ pip upgraded"
echo ""

# Install dependencies
echo "Installing Python dependencies (this may take a few minutes)..."
pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install dependencies."
    exit 1
fi
echo "✓ Dependencies installed"
echo ""

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "✓ .env file created"
    echo "  You can edit .env to customize configuration"
    echo ""
else
    echo "✓ .env file already exists"
    echo ""
fi

# Create necessary directories
echo "Creating upload and temp directories..."
mkdir -p uploads temp
echo "✓ Directories created"
echo ""

# Verify model file exists
MODEL_PATH="../model/final_brain_tumor_model_97.keras"
if [ ! -f "$MODEL_PATH" ]; then
    echo "⚠️  Warning: Model file not found at $MODEL_PATH"
    echo "   Please ensure the model file is in the correct location."
else
    echo "✓ Model file found"
fi
echo ""

echo "========================================="
echo "✅ Backend Setup Complete!"
echo "========================================="
echo ""
echo "To start the backend server:"
echo "  1. Activate the virtual environment:"
echo "     source backend/venv/bin/activate"
echo ""
echo "  2. Run the server:"
echo "     cd backend && python main.py"
echo ""
echo "  3. Access the API at:"
echo "     - API: http://localhost:8000"
echo "     - Docs: http://localhost:8000/api/docs"
echo ""
echo "To deactivate the virtual environment later, run:"
echo "  deactivate"
echo ""
