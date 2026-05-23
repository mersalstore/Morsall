@echo off
echo Zipping...
python create_full_zip.py
if %ERRORLEVEL% NEQ 0 exit /b

echo Uploading...
python upload_rebuild.py
if %ERRORLEVEL% NEQ 0 exit /b

echo Extracting...
.\plink.exe -batch -hostkey "ssh-ed25519 255 SHA256:LEMTGHJPbsNyMh+BVM/pAQmz7QMrntB9YlO9sMJsxQg" -pw "@n9qe3KgL" u754458241@82.198.228.182 -P 65002 "mv /home/u754458241/domains/morsall.com/public_html/fast_update.zip /home/u754458241/domains/morsall.com/nodejs/ 2>/dev/null; cd /home/u754458241/domains/morsall.com/nodejs && unzip -oq fast_update.zip && cp -r .next/static /home/u754458241/domains/morsall.com/public_html/_next/ 2>/dev/null || true; cp -r public/* /home/u754458241/domains/morsall.com/public_html/ 2>/dev/null || true; touch /home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt && echo RESTART_DONE"
echo DONE
