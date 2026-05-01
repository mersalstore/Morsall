@echo off
setlocal enabledelayedexpansion

echo.
echo ==========================================
echo    MORSALL - HOSTINGER DEPLOYMENT
echo ==========================================
echo.

REM Step 1: Generate Prisma Client
echo [1/5] Generating Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo ERROR: Prisma generation failed!
    pause
    exit /b 1
)
echo [OK] Prisma Client generated
echo.

REM Step 2: Build Next.js
echo [2/5] Building Next.js application...
call npm run build
if errorlevel 1 (
    echo ERROR: Next.js build failed!
    pause
    exit /b 1
)
echo [OK] Next.js build completed
echo.

REM Step 3: Prepare static assets for LiteSpeed
echo [3/5] Preparing static assets for LiteSpeed...
if exist _next (
    echo  Removing old _next directory...
    rmdir /s /q _next
)
echo  Creating _next directory...
mkdir _next
echo  Copying static assets from .next to _next...
xcopy /e /i /y .next\static _next\static > nul
if errorlevel 1 (
    echo ERROR: Failed to copy static assets!
    pause
    exit /b 1
)
echo [OK] Static assets prepared
echo.

REM Step 4: Verify .htaccess
echo [4/5] Verifying .htaccess configuration...
if exist .htaccess (
    echo [OK] .htaccess file exists
) else (
    echo WARNING: .htaccess file not found!
)
echo.

REM Step 5: Deployment summary
echo [5/5] Deployment preparation complete!
echo.
echo ==========================================
echo    READY FOR DEPLOYMENT
echo ==========================================
echo.
echo Next steps:
echo 1. Commit changes:
echo    git add .
echo    git commit -m "Hostinger deployment fix"
echo.
echo 2. Push to GitHub:
echo    git push origin main
echo.
echo 3. Hostinger will automatically pull and deploy
echo.
echo Directories to verify on Hostinger:
echo  - _next/static/ (CSS, JS, images)
echo  - public/ (public assets)
echo  - .next/ (Next.js build output)
echo.
echo Environment variables to set on Hostinger:
echo  - POSTGRES_PRISMA_URL
echo  - DATABASE_URL
echo  - NEXTAUTH_URL
echo  - NEXTAUTH_SECRET
echo  - GOOGLE_CLIENT_ID
echo  - GOOGLE_CLIENT_SECRET
echo.
echo ==========================================
echo.
pause
