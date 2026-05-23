@echo off
echo ==========================================
echo    MORSALL DEPLOYMENT SCRIPT (HOSTINGER)
echo ==========================================
echo.
echo Step 1/3: Creating the deployment ZIP file...
call node.exe scripts/create-deploy-zip.js
if %ERRORLEVEL% NEQ 0 (
    echo Error creating ZIP file!
    pause
    exit /b
)

echo.
echo Step 2/3: Uploading the ZIP file to Hostinger...
echo You will be asked for the SSH password for u754458241 (Code_2252)
scp -P 65002 Morsall_Hostinger_Deploy.zip u754458241@82.198.228.182:/home/u754458241/domains/morsall.com/nodejs/Morsall_Hostinger_Deploy.zip

echo.
echo Step 3/3: Extracting files, installing packages, and pushing database...
echo You will be asked for the SSH password AGAIN.
ssh -p 65002 u754458241@82.198.228.182 "cd /home/u754458241/domains/morsall.com/nodejs && unzip -o Morsall_Hostinger_Deploy.zip && npm install && npx prisma db push --accept-data-loss"

echo.
echo ==========================================
echo    DEPLOYMENT COMPLETE!
echo ==========================================
pause
