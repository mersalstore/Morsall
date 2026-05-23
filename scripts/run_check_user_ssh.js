const { Client } = require('ssh2');
const conn = new Client();
const fs = require('fs');
const path = require('path');

console.log('Connecting to Hostinger via SSH to run check_user...');

conn.on('ready', () => {
  console.log('✅ Connected successfully!');
  
  // Upload the check_user.js content
  const checkUserCode = fs.readFileSync(path.join(__dirname, 'check_user.js'), 'utf8');
  
  // We can write it directly on the server
  conn.exec(`cat << 'EOF' > /home/u754458241/domains/morsall.com/nodejs/scripts/check_user.js\n${checkUserCode}\nEOF\n`, (err, stream) => {
    if (err) {
      console.error('Error writing file:', err);
      conn.end();
      return;
    }
    stream.on('close', () => {
      console.log('check_user.js written to server.');
      
      // Run the script
      const cmd = `
        cd /home/u754458241/domains/morsall.com/nodejs
        export PATH=/opt/alt/alt-nodejs22/root/usr/bin:$PATH
        node scripts/check_user.js
      `;
      
      conn.exec(cmd, (err, runStream) => {
        if (err) {
          console.error('Error running script:', err);
          conn.end();
          return;
        }
        runStream.on('close', () => {
          conn.end();
        }).on('data', (data) => {
          process.stdout.write(data);
        }).stderr.on('data', (data) => {
          process.stderr.write(data);
        });
      });
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
