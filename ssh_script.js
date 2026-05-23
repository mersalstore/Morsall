const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Client :: ready');
  conn.exec('mv /home/u754458241/domains/morsall.com/public_html/fast_update.zip /home/u754458241/domains/morsall.com/nodejs/ 2>/dev/null; cd /home/u754458241/domains/morsall.com/nodejs && unzip -o fast_update.zip && touch tmp/restart.txt && echo "---UPDATE_AND_RESTART_DONE---"', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    });
  });
}).on('error', (err) => {
  console.error('Error:', err);
}).connect({
  host: '82.198.228.182',
  port: 65002,
  username: 'u754458241',
  password: 'Code_2252'
});
