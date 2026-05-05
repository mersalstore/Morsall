const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

async function createZip() {
  const zipPath = path.join(__dirname, '../Morsall_Hostinger_Deploy.zip');
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  console.log('Starting deployment ZIP creation...');

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      console.log('Archive created successfully at: ' + zipPath);
      console.log('Total size: ' + (archive.pointer() / 1024 / 1024).toFixed(2) + ' MB');
      resolve();
    });
    archive.on('error', (err) => reject(err));
    archive.pipe(output);

    const projectDir = path.join(__dirname, '..');
    const files = fs.readdirSync(projectDir);

    const ignoreList = [
      'node_modules', '.git', 'matger2-deploy.zip', 
      'matger2-hostinger-deploy.zip', 'Morsall_Deploy_Final.zip'
    ];

    files.forEach(file => {
      if (ignoreList.includes(file) || file.endsWith('.log')) {
        return;
      }
      const fullPath = path.join(projectDir, file);
      const isDirectory = fs.lstatSync(fullPath).isDirectory();
      if (isDirectory) {
        console.log(`Adding directory: ${file}`);
        archive.directory(fullPath, file);
      } else {
        console.log(`Adding file: ${file}`);
        archive.file(fullPath, { name: file });
      }
    });

    archive.finalize();
  });
}

createZip().catch(console.error);
