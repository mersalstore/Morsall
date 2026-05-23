#!/bin/bash
cd /home/u754458241/domains/morsall.com/nodejs
echo "=== Starting Prisma fix ==="
echo "=== Running npm install ==="
npm install --production 2>&1 | tail -5
echo "=== Running prisma generate ==="
npx prisma generate 2>&1 | tail -10
echo "=== Restarting server ==="
mkdir -p tmp
touch tmp/restart.txt
echo "=== DONE ==="
