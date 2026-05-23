const { Client } = require('ssh2');
const conn = new Client();

console.log('Connecting to Hostinger via SSH to check runtime error logs...');

conn.on('ready', () => {
  console.log('✅ Connected successfully!');
  
  const cmd = `
    echo "=== LAST 50 LINES OF stderr.log ==="
    tail -n 50 /home/u754458241/domains/morsall.com/public_html/stderr.log || echo "No stderr.log found"
    
    echo "=== SYSTEM LOGS OR PASSENGER LOGS ==="
    # Passenger sometimes writes to tmp or custom logs. Let's see what log files exist:
    find /home/u754458241/domains/morsall.com/ -name "*.log" -o -name "error_log" | xargs tail -n 20
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
