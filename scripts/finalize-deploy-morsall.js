const { Client } = require('ssh2');
const conn = new Client();
const remotePath = '/home/u754458241/domains/morsall.com/nodejs/';

console.log('Connecting to Hostinger...');

conn.on('ready', () => {
  console.log('✅ Connected.');
  
  // Run commands one by one for better tracking
  const runCmd = (cmd) => {
    return new Promise((resolve, reject) => {
      console.log(`Running: ${cmd}`);
      conn.exec(cmd, (err, stream) => {
        if (err) return reject(err);
        stream.on('close', (code) => {
          console.log(`Exited with code ${code}`);
          resolve(code);
        }).on('data', (data) => {
          process.stdout.write(data);
        }).stderr.on('data', (data) => {
          process.stderr.write(data);
        });
      });
    });
  };

  async function execute() {
    try {
      await runCmd(`cd ${remotePath} && unzip -o Morsall_Hostinger_Deploy.zip`);
      console.log('Unzipped.');
      await runCmd(`cd ${remotePath} && rm Morsall_Hostinger_Deploy.zip`);
      await runCmd(`cd ${remotePath} && npm install --production`);
      console.log('NPM Install done.');
      await runCmd(`cd ${remotePath} && npx prisma generate`);
      console.log('Prisma generated.');
      await runCmd(`cd ${remotePath} && mkdir -p tmp && touch tmp/restart.txt`);
      console.log('Restart triggered.');
      console.log('DONE! Deployment successful.');
      conn.end();
    } catch (e) {
      console.error('Error during execution:', e);
      conn.end();
    }
  }

  execute();
}).on('error', (err) => {
  console.error('Connection Error:', err);
}).connect({
  host: '82.198.228.182',
  port: 65002,
  username: 'u754458241',
  password: '@n9qe3KgL',
  readyTimeout: 30000
});
