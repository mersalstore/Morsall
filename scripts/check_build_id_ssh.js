const { Client } = require('ssh2');
const conn = new Client();
const https = require('https');

console.log('Connecting to Hostinger via SSH to check BUILD_ID...');

conn.on('ready', () => {
  console.log('✅ Connected successfully!');
  
  const cmd = `
    echo -n "Server Filesystem BUILD_ID: "
    cat /home/u754458241/domains/morsall.com/nodejs/.next/BUILD_ID
  `;
  
  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Execution Error:', err);
      conn.end();
      return;
    }
    stream.on('close', (code) => {
      // Now fetch the HTML from the website to see what buildId is in the client script
      https.get('https://www.morsall.com/login', (res) => {
        console.log('HTTP Status Code:', res.statusCode);
        console.log('HTTP Headers:', res.headers);
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          const matches = [...data.matchAll(/_next\/static\/([a-zA-Z0-9_-]{10,})\//g)].map(m => m[1]);
          const unique = [...new Set(matches)];
          console.log('Live Website static folders:', unique);
          conn.end();
        });
      }).on('error', (e) => {
        console.error('HTTP Fetch Error:', e);
        conn.end();
      });
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
