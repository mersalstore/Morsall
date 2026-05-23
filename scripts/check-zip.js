const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('ls -lh /home/u754458241/domains/morsall.com/nodejs/Morsall_Hostinger_Deploy.zip', (err, stream) => {
    if (err) { console.error(err); conn.end(); return; }
    stream.on('close', () => conn.end()).on('data', (data) => process.stdout.write(data));
  });
}).on('error', (err) => {
  console.error('Connection Error:', err);
}).connect({
  host: '82.198.228.182', port: 65002, username: 'u754458241', password: 'Code_2252'
});
