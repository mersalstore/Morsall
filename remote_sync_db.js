const { Client } = require('ssh2');

const config = {
  host: '82.198.228.182',
  port: 65002,
  username: 'u754458241',
  password: '@n9qe3KgL',
};

console.log('Attempting to connect to SSH...');
const conn = new Client();
conn.on('ready', () => {
  console.log('✅ Connected to Hostinger via SSH.');
  
  const cmd = 'pwd';

  console.log('⏳ Running pwd on server...');
  
  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('EXEC ERROR:', err);
      return;
    }
    stream.on('close', (code, signal) => {
      console.log('✨ Remote command finished with code:', code);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      process.stderr.write('STDERR: ' + data);
    });
  });
}).on('error', (err) => {
  console.error('❌ SSH Connection Error:', err.message);
}).connect(config);

// Keep alive for 30 seconds
setTimeout(() => {
  console.log('Timeout reached. Closing connection.');
  conn.end();
}, 60000);
