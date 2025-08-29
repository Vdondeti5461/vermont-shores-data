#!/bin/bash

echo "🚀 Quick Start Summit2Shore API"
echo "================================"

# Stop any existing servers
pkill -f "node.*server.js" 2>/dev/null || echo "No existing server found"

# Navigate to API directory
cd ~/api || { echo "❌ API directory not found"; exit 1; }

# Install dependencies if missing
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install --production
fi

# Verify .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found"
    exit 1
fi

echo "✅ Environment:"
cat .env

# Start server directly
echo "🚀 Starting API server..."
nohup node server.js > server.log 2>&1 &

# Wait and check if server started
sleep 3
PID=$(pgrep -f "node.*server.js")

if [ -n "$PID" ]; then
    echo "✅ API server running (PID: $PID)"
    echo "📋 Log: tail -f ~/api/server.log"
    echo "🌐 Production URL: http://vdondeti.w3.uvm.edu"
    echo "🔧 Health check: http://vdondeti.w3.uvm.edu/health"
    echo "🛑 Stop: pkill -f 'node.*server.js'"
else
    echo "❌ Server failed to start"
    echo "📋 Check: ~/api/server.log"
fi