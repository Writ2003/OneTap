#!/bin/bash

echo "Starting Document Share App..."
echo

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "ERROR: Java is not installed or not in PATH"
    echo "Please install Java 17+ and try again"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js 18+ and try again"
    exit 1
fi

echo "Starting backend (OneTap)..."
cd OneTap
gnome-terminal --title="OneTap Backend" -- bash -c "mvn spring-boot:run; exec bash" 2>/dev/null || \
xterm -title "OneTap Backend" -e "mvn spring-boot:run; exec bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '$(pwd)' && mvn spring-boot:run"' 2>/dev/null || \
echo "Please start the backend manually: cd OneTap && mvn spring-boot:run"

echo "Waiting for backend to start..."
sleep 10

echo "Starting frontend (document-share-app)..."
cd ../document-share-app
gnome-terminal --title="Document Share Frontend" -- bash -c "npm run dev; exec bash" 2>/dev/null || \
xterm -title "Document Share Frontend" -e "npm run dev; exec bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '$(pwd)' && npm run dev"' 2>/dev/null || \
echo "Please start the frontend manually: cd document-share-app && npm run dev"

echo
echo "Application is starting..."
echo "Backend will be available at: http://localhost:8080"
echo "Frontend will be available at: http://localhost:5173"
echo
echo "Press Ctrl+C to exit this script (services will continue running)"
echo "Or close the terminal windows to stop the services"

# Keep the script running
while true; do
    sleep 1
done
