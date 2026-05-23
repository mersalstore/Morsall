@echo off
title Morsall Auto-Deploy Tool
echo 🚀 Starting Automated Deployment for Morsall...
echo.
cd /d "%~dp0"
echo 📦 Current Directory: %cd%
echo.
echo ⚠️  Please close heavy applications (Chrome, Games) to free up RAM.
echo.
pause
echo 🏗️  Building and Deploying...
npm run deploy
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Deployment Failed! Please check the errors above.
) else (
    echo.
    echo 🎉 Deployment Successful! Your site is now live and updated.
)
echo.
pause
