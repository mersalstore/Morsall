const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

async function createZip() {
  const zipPath = path.join(__dirname, '../matger2-deploy.zip');
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      console.log('Archive created successfully at: ' + zipPath);
      console.log('Total bytes: ' + archive.pointer());
      resolve();
    });
    archive.on('error', (err) => reject(err));
    archive.pipe(output);

    const projectDir = path.join(__dirname, '..');
    const files = fs.readdirSync(projectDir);

    const ignoreList = [
      'node_modules', '.git', '.next', '_next', 
      'matger2-deploy.zip', 'ssh_script.js', 'ssh_script.py', 
      'ssh_script2.py', 'ssh_script3.py', 'ssh_check_logs.py', 
      'ssh_output.txt', 'scripts', 'prisma/dev.db'
    ];

    files.forEach(file => {
      if (ignoreList.includes(file) || file.endsWith('.zip') || file.endsWith('.log')) {
        return;
      }
      const fullPath = path.join(projectDir, file);
      const isDirectory = fs.lstatSync(fullPath).isDirectory();
      if (isDirectory) {
        archive.directory(fullPath, file);
      } else {
        archive.file(fullPath, { name: file });
      }
    });

    archive.finalize();
  });
}

createZip().catch(console.error);
