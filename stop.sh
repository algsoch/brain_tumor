#!/bin/bash

# Brain Tumor Detection - Stop Script
# This script stops both backend and frontend servers

echo "🛑 Stopping Brain Tumor Detection System..."

# Function to kill process on port
kill_port() {
    if lsof -ti:$1 >/dev/null 2>&1; then
        echo "Stopping process on port $1..."
        lsof -ti:$1 | xargs kill -9 2>/dev/null || true
        echo "✅ Port $1 freed"
    else
        echo "ℹ️  No process running on port $1"
    fi
}

# Stop backend (port 8000)
kill_port 8000

# Stop frontend (port 3000 and 5173)
kill_port 3000
kill_port 5173

echo ""
echo "✅ All servers stopped successfully"
