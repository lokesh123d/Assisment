#!/bin/bash

echo "🚀 Starting QuizMaster Application..."
echo ""

# Check if MongoDB is running
echo "📊 Checking MongoDB..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   Run: mongod"
    echo ""
    exit 1
fi

echo "✅ MongoDB is running"
echo ""

# Start backend
echo "🔧 Starting Backend Server..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo "🎨 Starting Frontend..."
cd ..
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Application started successfully!"
echo ""
echo "📝 Frontend: http://localhost:5173"
echo "🔌 Backend API: http://localhost:5000/api"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
