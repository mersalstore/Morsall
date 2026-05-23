const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const HOST = '82.198.228.182';
const PORT = 65002;
const USER = 'u754458241';
const PASS = '@n9qe3KgL';
const REMOTE_PATH = '/home/u754458241/domains/morsall.com/nodejs/';
const ZIP_NAME = 'Morsall_Hostinger_Deploy.zip';

async function createZip() {
  const zipPath = path.join(__dirname, '..', ZIP_NAME);
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      console.log(`Created ${ZIP_NAME} (${(archive.pointer() / 1024 / 1024).toFixed(2)} MB)`);
      resolve(zipPath);
    });
    archive.on('error', reject);
    archive.pipe(output);

    const projectDir = path.join(__dirname, '..');
    const files = fs.readdirSync(projectDir);
    const ignoreList = ['node_modules', '.git', 'staging_deploy', 'scratch', '.vercel', '_next', '.next/cache'];

    const prismaClientPath = path.join(projectDir, 'node_modules/@prisma/client');
    if (fs.existsSync(prismaClientPath)) {
      console.log('Adding Prisma client...');
      archive.directory(prismaClientPath, 'node_modules/@prisma/client');
    }

    files.forEach(file => {
      if (ignoreList.includes(file) ||
          file.toLowerCase().endsWith('.log') ||
          file.toLowerCase().endsWith('.zip') ||
          file.toLowerCase().endsWith('.bat') ||
          file.toLowerCase().endsWith('.py') ||
          file.toLowerCase().endsWith('.php')) {
        return;
      }

      const fullPath = path.join(projectDir, file);
      const isDirectory = fs.lstatSync(fullPath).isDirectory();
      if (isDirectory) {
        console.log(`  + dir: ${file}`);
        archive.directory(fullPath, file, (entry) => {
          if (entry.name.includes('/cache/') || entry.name.includes('\\cache\\')) return false;
          return entry;
        });
      } else {
        console.log(`  + file: ${file}`);
        archive.file(fullPath, { name: file });
      }
    });

    archive.finalize();
  });
}

function uploadZip(zipPath) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn.on('ready', () => {
      console.log('✅ SSH connected. Uploading zip...');
      conn.sftp((err, sftp) => {
        if (err) { reject(err); conn.end(); return; }
        const remote = REMOTE_PATH + ZIP_NAME;
        const readStream = fs.createReadStream(zipPath);
        const writeStream = sftp.createWriteStream(remote);
        writeStream.on('close', () => {
          console.log('✅ Upload complete.');
          conn.end();
          resolve();
        });
        writeStream.on('error', reject);
        readStream.pipe(writeStream);
      });
    }).on('keyboard-interactive', (name, instructions, lang, prompts, finish) => {
      if (prompts.length > 0 && prompts[0].prompt.toLowerCase().includes('password')) {
        finish([PASS]);
      } else { finish([]); }
    }).on('error', reject).connect({
      host: HOST, port: PORT, username: USER, password: PASS,
      tryKeyboard: true, readyTimeout: 30000
    });
  });
}

function sshExec() {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn.on('ready', () => {
      console.log('✅ SSH re-connected. Running deploy commands...');
      async function runCmd(cmd) {
        return new Promise((res, rej) => {
          conn.exec(cmd, (err, stream) => {
            if (err) return rej(err);
            stream.on('close', (code) => {
              console.log(`  Exit code: ${code}`);
              res(code);
            }).on('data', (d) => process.stdout.write(d))
            .stderr.on('data', (d) => process.stderr.write(d));
          });
        });
      }
      (async () => {
        try {
          await runCmd(`cd ${REMOTE_PATH} && unzip -o ${ZIP_NAME}`);
          await runCmd(`cd ${REMOTE_PATH} && rm ${ZIP_NAME}`);
          await runCmd(`cd ${REMOTE_PATH} && npm install --production`);
          console.log('npm install done.');
          await runCmd(`cd ${REMOTE_PATH} && npx prisma generate`);
          console.log('Prisma generated.');
          await runCmd(`cd ${REMOTE_PATH} && mkdir -p tmp && touch tmp/restart.txt`);
          console.log('✅ Restart triggered.');
          console.log('✅ DEPLOYMENT COMPLETE!');
          conn.end();
          resolve();
        } catch (e) { reject(e); conn.end(); }
      })();
    }).on('error', reject).connect({
      host: HOST, port: PORT, username: USER, password: PASS,
      readyTimeout: 30000
    });
  });
}

(async () => {
  try {
    const zipPath = await createZip();
    await uploadZip(zipPath);
    await sshExec();
  } catch (e) {
    console.error('❌ Deployment failed:', e);
    process.exit(1);
  }
})();
