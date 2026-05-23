const { Client } = require('ssh2');
const conn = new Client();
const remotePath = '/home/u754458241/domains/morsall.com/nodejs/';

console.log('Connecting to Hostinger with Morsall@1234...');

conn.on('ready', () => {
  console.log('✅ Connected successfully!');
  
  const cmd = `cd ${remotePath} && unzip -o Morsall_Hostinger_Deploy.zip && rm Morsall_Hostinger_Deploy.zip && npm install --production && npx prisma generate && mkdir -p tmp && touch tmp/restart.txt`;
  
  console.log('Executing command:', cmd);
  
  conn.exec(cmd, (err, stream) => {
    if (err) { console.error(err); conn.end(); return; }
    stream.on('close', (code) => {
      console.log('Extraction & Setup completed with code ' + code);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).on('error', (err) => {
  console.error('Connection Error:', err);
}).connect({
  host: '82.198.228.182',
  port: 65002,
  username: 'u754458241',
  password: 'Morsall@1234',
  readyTimeout: 30000
});
