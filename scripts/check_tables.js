const { Client } = require('ssh2');
const conn = new Client();

console.log('Connecting to Hostinger via SSH to check Prisma schema tables...');

conn.on('ready', () => {
  console.log('✅ Connected successfully!');
  
  const queryCode = `
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    async function check() {
      try {
        const branches = await prisma.branch.findMany({ take: 1 });
        console.log('✅ Branch table exists. Found:', branches.length);
        
        const driverSettlements = await prisma.driverSettlement.findMany({ take: 1 });
        console.log('✅ DriverSettlement table exists. Found:', driverSettlements.length);
        
        const savedAddresses = await prisma.savedAddress.findMany({ take: 1 });
        console.log('✅ SavedAddress table exists. Found:', savedAddresses.length);
      } catch (err) {
        console.error('❌ Error finding tables:', err.message);
      } finally {
        await prisma.$disconnect();
      }
    }
    check();
  `;
  
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
