@echo off
setlocal
echo ==========================================
echo    MORSALL - AUTO DEPLOYMENT SYSTEM
echo ==========================================

echo [1/4] Preparing database models...
call npx prisma generate

echo [2/4] Building your website (Generating latest colors and designs)...
call npm run build

echo [3/4] Fixing Hostinger CSS (LiteSpeed Fix)...
if exist _next (
    rmdir /s /q _next
)
mkdir _next
xcopy /e /i /y .next\static _next\static > nul

echo [4/4] Uploading to GitHub...
git add .
git commit -m "Automatic update: %date% %time%"
git push origin main

echo.
echo ==========================================
echo    SUCCESS! Site updated on GitHub.
echo    Hostinger is now pulling changes...
echo ==========================================
echo Your site will be ready in 1-2 minutes.
pause
