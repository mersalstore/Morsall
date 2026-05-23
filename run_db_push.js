const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('Running prisma db push...');
  // Find prisma CLI
  const prismaPath = path.resolve(__dirname, 'node_modules/prisma/build/index.js');
  console.log('Using prisma path:', prismaPath);
  
  const output = execSync(`/opt/alt/alt-nodejs20/root/usr/bin/node ${prismaPath} db push --skip-generate`, {
    env: {
      ...process.env,
      PATH: '/opt/alt/alt-nodejs20/root/usr/bin:' + process.env.PATH,
      DATABASE_URL: 'mysql://u754458241_Kanan:Mersal2026@127.0.0.1/u754458241_Kanan'
    }
  });
  console.log('Prisma Output:', output.toString());
} catch (err) {
  console.error('Error running prisma:', err.message);
  if (err.stdout) console.log('STDOUT:', err.stdout.toString());
  if (err.stderr) console.log('STDERR:', err.stderr.toString());
}
