#!/bin/bash

echo "🚀 Setting up Summit2Shore Production Environment"
echo "=============================================="

# Kill any existing server processes
echo "📛 Stopping existing API server..."
pkill -f "node.*server.js" || echo "No existing server found"

# Navigate to API directory
cd ~/api || { echo "❌ API directory not found"; exit 1; }

# Verify environment file
if [ ! -f .env ]; then
    echo "❌ .env file not found in ~/api/"
    exit 1
fi

echo "✅ Environment configuration:"
grep -E "^(MYSQL_HOST|MYSQL_USER|PORT)" .env || echo "⚠️  Environment variables not found"

# Ensure dependencies and export env for Node
# Install node_modules if missing
if [ ! -d node_modules ]; then
  echo "📦 Installing dependencies (node_modules missing)..."
  npm ci --omit=dev || npm i --omit=dev
fi

# Ensure required packages are present
npm ls --depth=0 dotenv >/dev/null 2>&1 || { echo "📦 Installing dotenv..."; npm i dotenv --omit=dev -y >/dev/null 2>&1; }
npm ls --depth=0 mysql2 >/dev/null 2>&1 || { echo "📦 Installing mysql2..."; npm i mysql2 --omit=dev -y >/dev/null 2>&1; }

# Export .env to current shell so node -e can read process.env
set -a
. ./.env
set +a

# Test database connection
echo "🔍 Testing database connection..."
node -e "
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      port: process.env.MYSQL_PORT || 3306,
      ssl: { rejectUnauthorized: false }
    });
    
    const [rows] = await connection.execute('SHOW DATABASES LIKE \\\"CRRELS2S_%\\\"');
    console.log('✅ Database connection successful');
    console.log('📊 Available CRREL databases:', rows.length);
    await connection.end();
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
"

if [ $? -ne 0 ]; then
    echo "❌ Database connection test failed"
    exit 1
fi

# Start the API server
echo "🚀 Starting API server..."
nohup node server.js > server.log 2>&1 &
sleep 2

# Get the process ID
PID=$(pgrep -f "node.*server.js")
if [ -n "$PID" ]; then
    echo "✅ API server started successfully (PID: $PID)"
    echo "📋 Log file: ~/api/server.log"
else
    echo "❌ Failed to start API server"
    echo "📋 Check log: ~/api/server.log"
    exit 1
fi

# Test API endpoints
echo "🧪 Testing API endpoints..."
sleep 3

# Test health endpoint
echo "Testing health endpoint..."
curl -s "http://localhost:3001/health" | grep -q "healthy" && \
    echo "✅ Health check passed" || \
    echo "❌ Health check failed"

# Test databases endpoint
echo "Testing databases endpoint..."
curl -s "http://localhost:3001/api/databases" | grep -q "databases" && \
    echo "✅ Databases endpoint working" || \
    echo "❌ Databases endpoint failed"

# Test through web server (production URL)
echo "Testing production URL..."
curl -s "http://vdondeti.w3.uvm.edu/health" | grep -q "healthy" && \
    echo "✅ Production health check passed" || \
    echo "⚠️  Production health check failed - check .htaccess proxy"

echo ""
echo "🎉 Setup complete!"
echo "=============================================="
echo "📍 Frontend URL: http://vdondeti.w3.uvm.edu"
echo "🔧 API Health: http://vdondeti.w3.uvm.edu/health"
echo "📊 API Docs: http://vdondeti.w3.uvm.edu/api/databases"
echo "📋 Server Log: tail -f ~/api/server.log"
echo "🛑 Stop Server: pkill -f 'node.*server.js'"
echo "=============================================="