const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const config = {
  host: '82.198.228.182',
  port: 65002,
  username: 'u754458241',
  password: '@n9qe3KgL',
  keepaliveInterval: 10000, // 10 seconds
  keepaliveCountMax: 3
};

async function fastDeploy() {
  console.log("Starting fast deploy script...");
  const conn = new Client();
  console.log("Client created.");
  conn.on('ready', () => {
    console.log('✅ Connected to Hostinger. Starting SFTP...');
    conn.sftp((err, sftp) => {
      if (err) {
        console.error('SFTP Error:', err);
        conn.end();
        return;
      }
      const remotePath = '/home/u754458241/domains/morsall.com/public_html/app_new/fast_update.zip';
      console.log('📤 Uploading fast_update.zip to ' + remotePath);
      sftp.fastPut('fast_update.zip', remotePath, (err) => {
        if (err) {
          console.error('Upload Error:', err);
          conn.end();
          return;
        }
        console.log('✅ Uploaded. Now extracting...');
        
        conn.exec(`cd /home/u754458241/domains/morsall.com/public_html/app_new && unzip -o fast_update.zip && touch tmp/restart.txt`, (err, stream) => {
          if (err) {
            console.error('Exec Error:', err);
            conn.end();
            return;
          }
          stream.on('data', (data) => console.log('STDOUT: ' + data));
          stream.stderr.on('data', (data) => console.log('STDERR: ' + data));
          stream.on('close', () => {
            console.log('✨ Fast Deploy finished!');
            conn.end();
          });
        });
      });
    });
  }).on('error', (err) => {
    console.error('❌ Connection Error:', err.message);
  }).connect(config);
}

fastDeploy().catch(err => {
  console.error("FATAL ERROR:", err);
  process.exit(1);
});
