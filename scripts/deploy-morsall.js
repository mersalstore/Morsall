#!/usr/bin/env node
/**
 * MORSALL HOSTINGER DEPLOYMENT HELPER
 * =====================================
 * يرفع الملفات المهمة على Hostinger بعد كل تعديل
 * 
 * الاستخدام: node scripts/deploy-morsall.js
 */

const path = require('path');
const fs   = require('fs');

const FILES_TO_UPLOAD = [
  // Server + config
  'server-hostinger.js',
  '.env.production',
  'next.config.js',
  // Next build output
  '.next',
  // Public uploads folder
  'public/uploads',
];

console.log('=== Morsall Deploy Checklist ===\n');

FILES_TO_UPLOAD.forEach(f => {
  const full = path.join(__dirname, '..', f);
  const exists = fs.existsSync(full);
  console.log(`${exists ? '✅' : '❌'} ${f}`);
});

console.log('\n📋 Upload these files to Hostinger /public_html/ via FTP/File Manager:');
FILES_TO_UPLOAD.forEach(f => console.log(`   → ${f}`));

console.log('\n🔑 After uploading, on Hostinger SSH run:');
console.log('   touch /home/u754458241/public_html/tmp/restart.txt');
console.log('   # OR go to Node.js App manager and click Restart\n');
