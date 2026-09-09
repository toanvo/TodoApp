#!/bin/bash

set -e

# Get the directory where this script is located
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

BACKEND_DIR="$ROOT_DIR/TodoWebApi/src"
FRONTEND_DIR="$ROOT_DIR/todo-ui/todo-app"

echo "======================================"
echo " Starting Todo Application"
echo "======================================"

# Check prerequisites
command -v dotnet >/dev/null 2>&1 || {
    echo "Error: .NET SDK is not installed."
    exit 1
}

command -v npm >/dev/null 2>&1 || {
    echo "Error: Node.js/npm is not installed."
    exit 1
}

echo ""
echo "Starting .NET 10 backend..."

cd "$BACKEND_DIR"
dotnet run &
BACKEND_PID=$!

echo "Backend PID: $BACKEND_PID"

echo ""
echo "Starting Angular frontend..."

cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
    echo "node_modules not found. Installing dependencies..."
    npm install
fi

npm start &
FRONTEND_PID=$!

echo "Frontend PID: $FRONTEND_PID"

# Cleanup when Ctrl+C is pressed
cleanup() {
    echo ""
    echo "Stopping applications..."

    kill "$BACKEND_PID" 2>/dev/null || true
    kill "$FRONTEND_PID" 2>/dev/null || true

    echo "Applications stopped."
}

trap cleanup SIGINT SIGTERM

echo ""
echo "======================================"
echo " Application is running"
echo "======================================"
echo " Backend:  http://localhost:5190"
echo " Frontend: http://localhost:4200"
echo ""
echo " Press Ctrl+C to stop both applications"
echo "======================================"

# Keep script running
wait