const { Client } = require('ssh2');
const conn = new Client();

console.log('Connecting to Hostinger via SSH to search for backups...');

conn.on('ready', () => {
  console.log('✅ Connected successfully!');
  
  const cmd = `
    echo "=== SEARCHING ZIP AND TAR FILES ON SERVER ==="
    find /home/u754458241/ -maxdepth 3 -name "*.zip" -o -name "*.tar.gz" -o -name "*.tgz" -o -name "*.bak"
  `;
  
  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error(err);
      conn.end();
      return;
    }
    stream.on('close', () => conn.end())
          .on('data', data => process.stdout.write(data))
          .stderr.on('data', data => process.stderr.write(data));
  });
}).on('keyboard-interactive', (name, instructions, lang, prompts, finish) => {
  finish(['@n9qe3KgL']);
}).connect({
  host: '82.198.228.182',
  port: 65002,
  username: 'u754458241',
  password: '@n9qe3KgL',
  tryKeyboard: true
});
