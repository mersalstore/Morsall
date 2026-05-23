#!/usr/bin/env node
// Fix logo in DB and verify
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const current = await p.settings.findUnique({ where: { id: 'global' } });
  console.log('Current logo:', current ? current.logo : 'NO RECORD');
  
  const updated = await p.settings.update({
    where: { id: 'global' },
    data: { logo: '/logo.png' }
  });
  console.log('Updated logo to:', updated.logo);
  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
