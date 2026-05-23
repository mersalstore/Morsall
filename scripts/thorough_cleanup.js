const { Client } = require('ssh2');
const conn = new Client();

console.log('Connecting to Hostinger via SSH for thorough cleanup...');

conn.on('ready', () => {
  console.log('✅ Connected successfully!');
  
  const cmd = `
    echo "=== CLEANING DOMAIN LEVEL OLD FILES ==="
    rm -rf /home/u754458241/domains/morsall.com/.next
    rm -rf /home/u754458241/domains/morsall.com/app
    rm -rf /home/u754458241/domains/morsall.com/_next
    rm -rf /home/u754458241/domains/morsall.com/fast_update_root.zip
    rm -rf /home/u754458241/domains/morsall.com/fast_update.tar.gz
    rm -rf /home/u754458241/domains/morsall.com/next_build_update.zip
    
    echo "=== CLEANING NODEAPP LEVEL OLD FILES ==="
    rm -rf /home/u754458241/nodeapp/.next
    rm -rf /home/u754458241/nodeapp/_next
    rm -rf /home/u754458241/nodeapp/src
    
    echo "=== VERIFYING CLEANUP ==="
    echo "--- Domain dir ---"
    ls -la /home/u754458241/domains/morsall.com/
    echo "--- Nodeapp dir ---"
    ls -la /home/u754458241/nodeapp/
    
    echo "=== TOUCHING RESTART FILE ==="
    mkdir -p /home/u754458241/domains/morsall.com/nodejs/tmp
    touch /home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt
    
    echo "=== CLEANUP COMPLETED ==="
  `;
  
  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Execution Error:', err);
      conn.end();
      return;
    }
    stream.on('close', (code) => {
      console.log('SSH cleanup completed with exit code: ' + code);
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
