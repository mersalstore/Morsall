const { Client } = require('ssh2');
const conn = new Client();

console.log('Connecting to Hostinger via SSH to inspect subfolder space usage...');

conn.on('ready', () => {
  console.log('✅ Connected successfully!');
  
  const cmd = `
    echo "=== TOP 15 LARGEST ITEMS IN PUBLIC_HTML ==="
    du -h --max-depth=1 /home/u754458241/domains/morsall.com/public_html/ | sort -h -r | head -n 15
    
    echo "=== TOP 15 LARGEST ITEMS IN NODEAPP ==="
    du -h --max-depth=1 /home/u754458241/nodeapp/ | sort -h -r | head -n 15
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
