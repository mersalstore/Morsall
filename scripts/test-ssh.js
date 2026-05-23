const { Client } = require('ssh2');
const conn = new Client();

console.log('Connecting...');

conn.on('ready', () => {
  console.log('✅ READY');
  conn.exec('ls', (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end()).on('data', (data) => console.log(data.toString()));
  });
}).on('keyboard-interactive', (name, instructions, lang, prompts, finish) => {
  console.log('Keyboard interactive prompted');
  if (prompts.length > 0 && prompts[0].prompt.toLowerCase().includes('password')) {
    finish(['Morsall@1234']);
  } else {
    finish([]);
  }
}).on('error', (err) => {
  console.error('Error:', err);
}).connect({
  host: '82.198.228.182',
  port: 65002,
  username: 'u754458241',
  password: 'Morsall@1234',
  tryKeyboard: true
});
