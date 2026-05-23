const fs = require('fs');
const path = require('path');

const root = '/home/u754458241/domains/morsall.com/nodejs';
const files = [
  'prisma_client.zip',
  'node_modules/.prisma/client/index.js',
  'node_modules/.prisma/client/query-engine-rhel-openssl-3.0.x'
];

console.log('Checking files...');
files.forEach(f => {
  const p = path.join(root, f);
  if (fs.existsSync(p)) {
    console.log(`[OK] ${f} exists (${fs.statSync(p).size} bytes)`);
  } else {
    console.log(`[MISSING] ${f}`);
  }
});

const nm = path.join(root, 'node_modules/.prisma/client');
if (fs.existsSync(nm)) {
    console.log('Contents of ' + nm + ':');
    console.log(fs.readdirSync(nm).join('\n'));
} else {
    console.log('Folder ' + nm + ' does not exist');
}
