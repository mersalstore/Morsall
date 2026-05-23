@echo off
echo y | .\plink.exe -P 65002 -pw Morsall@1234 u754458241@82.198.228.182 "cd /home/u754458241/domains/morsall.com/nodejs && unzip -o Morsall_Hostinger_Deploy.zip && rm Morsall_Hostinger_Deploy.zip && npm install --production && npx prisma generate && mkdir -p tmp && touch tmp/restart.txt"
