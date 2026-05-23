const { Client } = require('ssh2');
const conn = new Client();

console.log('Connecting to Hostinger via SSH to query admin roles directly...');

conn.on('ready', () => {
  console.log('✅ Connected successfully!');
  
  const queryCode = `
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    prisma.user.findMany().then(users => {
      console.log('=== ALL USERS IN DB ===');
      users.forEach(u => {
        console.log(\`ID: \${u.id} | Email: \${u.email} | Name: \${u.name} | Role: \${u.role} | Permissions: \${JSON.stringify(u.permissions)}\`);
      });
      process.exit(0);
    }).catch(err => {
      console.error('Prisma Error:', err);
      process.exit(1);
    });
  `;
  
  // Format the code into a single line for node -e
  const escapedCode = queryCode.replace(/`/g, '\\`').replace(/\$/g, '\\$');
  const cmd = `
    cd /home/u754458241/domains/morsall.com/nodejs
    export PATH=/opt/alt/alt-nodejs22/root/usr/bin:$PATH
    node -e "${escapedCode.replace(/"/g, '\\"')}"
  `;
  
  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Execution Error:', err);
      conn.end();
      return;
    }
    stream.on('close', (code) => {
      console.log('Query finished with exit code: ' + code);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).on('keyboard-interactive', (name, instructions, lang, prompts, finish) => {
  if (prompts.length > 0 && prompts[0].prompt.toLowerCase().includes('password')) {
    finish(['@n9qe3KgL']);
  } else {
    finish([]);
  }
}).on('error', (err) => {
  console.error('Connection Error:', err);
}).connect({
  host: '82.198.228.182',
  port: 65002,
  username: 'u754458241',
  password: '@n9qe3KgL',
  tryKeyboard: true,
  readyTimeout: 30000
});
