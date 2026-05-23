#!/bin/bash
export PATH=/opt/alt/alt-nodejs20/root/usr/bin:$PATH
cd /home/u754458241/nodeapp
echo "Installing prisma 6.2.1..."
npm install prisma@6.2.1 @prisma/client@6.2.1 --no-save
echo "Checking version..."
node node_modules/prisma/build/index.js -v
