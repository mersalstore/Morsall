const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '../src/app/admin/dashboard/page.tsx');
const dest = path.resolve(__dirname, '../src/app/admin/dashboard/DashboardClient.tsx');

console.log('Source:', src);
console.log('Dest:', dest);

try {
  fs.copyFileSync(src, dest);
  console.log('✅ File copied successfully!');
  console.log('Dest size:', fs.statSync(dest).size);
} catch (err) {
  console.error('❌ Copy failed:', err);
}
