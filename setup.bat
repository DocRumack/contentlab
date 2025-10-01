@echo off
echo 🚀 Content Creation Lab - Setup Script
echo ======================================
echo.

REM Check if node is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js found: %NODE_VERSION%

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm found: %NPM_VERSION%

REM Install dependencies
echo.
echo 📦 Installing dependencies...
call npm install

REM Create necessary directories
echo.
echo 📁 Creating directories...
if not exist "automation\screenshots" mkdir automation\screenshots
if not exist "automation\outputs" mkdir automation\outputs
if not exist "automation\logs" mkdir automation\logs

REM Success message
echo.
echo ✨ Setup complete!
echo.
echo To start the Content Lab:
echo   npm run dev
echo.
echo To run in headless mode:
echo   npm run headless
echo.
echo To start the API server:
echo   npm run api
echo.
echo The lab will be available at: http://localhost:3002
echo.
pause
