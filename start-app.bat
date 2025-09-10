@echo off
echo Starting Document Share App...
echo.

echo Checking if Java is installed...
java -version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Java is not installed or not in PATH
    echo Please install Java 17+ and try again
    pause
    exit /b 1
)

echo Checking if Node.js is installed...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 18+ and try again
    pause
    exit /b 1
)

echo Starting backend (OneTap)...
cd OneTap
start "OneTap Backend" cmd /k "mvn spring-boot:run"

echo Waiting for backend to start...
timeout /t 10 /nobreak >nul

echo Starting frontend (document-share-app)...
cd ..\document-share-app
start "Document Share Frontend" cmd /k "npm run dev"

echo.
echo Application is starting...
echo Backend will be available at: http://localhost:8080
echo Frontend will be available at: http://localhost:5173
echo.
echo Press any key to exit this script (services will continue running)
pause >nul
