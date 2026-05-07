const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

console.log('Starting deployment script...');

const conn = new Client();
const localFile = path.join(__dirname, '..', 'Morsall_Deploy_Final.zip');
const remoteFile = '/home/u754458241/domains/morsall.com/nodejs/Morsall_Deploy_Final.zip';

console.log('Local file:', localFile);
console.log('Remote file:', remoteFile);

if (!fs.existsSync(localFile)) {
  console.error('Error: Local zip file not found!');
  process.exit(1);
}

conn.on('ready', () => {
  console.log('SSH Connection Ready');
  conn.sftp((err, sftp) => {
    if (err) {
      console.error('SFTP Error:', err);
      conn.end();
      return;
    }
    console.log('SFTP Ready, starting upload...');
    
    const readStream = fs.createReadStream(localFile);
    const writeStream = sftp.createWriteStream(remoteFile);

    writeStream.on('close', () => {
      console.log('Upload completed');
      
      console.log('Extracting zip...');
      conn.exec(`cd /home/u754458241/domains/morsall.com/nodejs/ && unzip -o Morsall_Deploy_Final.zip && rm Morsall_Deploy_Final.zip`, (err, stream) => {
        if (err) {
          console.error('Exec Error:', err);
          conn.end();
          return;
        }
        stream.on('close', (code, signal) => {
          console.log('Extraction completed with code ' + code);
          
          console.log('Running npm install...');
          conn.exec(`cd /home/u754458241/domains/morsall.com/nodejs/ && npm install`, (err, stream) => {
            if (err) {
              console.error('Install Error:', err);
              conn.end();
              return;
            }
            stream.on('close', () => {
              console.log('npm install completed');
              conn.end();
            }).on('data', (data) => {
              process.stdout.write(data);
            });
          });
        }).on('data', (data) => {
          process.stdout.write(data);
        });
      });
    });

    writeStream.on('error', (err) => {
      console.error('Upload error:', err);
      conn.end();
    });

    readStream.pipe(writeStream);
  });
}).on('error', (err) => {
  console.error('Connection Error:', err);
}).connect({
  host: '82.198.228.182',
  port: 65002,
  username: 'u754458241',
  password: 'Code_2252',
  readyTimeout: 20000
});
