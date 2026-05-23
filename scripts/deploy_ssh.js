const { Client } = require('ssh2');
const conn = new Client();
const remotePath = '/home/u754458241/domains/morsall.com/nodejs/';

console.log('Connecting to Hostinger via SSH...');

conn.on('ready', () => {
  console.log('✅ Connected successfully!');
  
  const cmd = `cd ${remotePath} && echo "=== CLEANING OLD DIRECTORIES ===" && rm -rf .next _next src && echo "=== UNZIPPING NEW UPDATE ===" && unzip -o final_update.zip && unzip -o fix_modules.zip && rm -f final_update.zip fix_modules.zip && mkdir -p tmp && touch tmp/restart.txt && echo "=== EXTRACTED AND RESTARTED ==="`;
  
  console.log('Executing command:', cmd);
  
  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Execution Error:', err);
      conn.end();
      return;
    }
    stream.on('close', (code) => {
      console.log('SSH execution completed with exit code: ' + code);
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
