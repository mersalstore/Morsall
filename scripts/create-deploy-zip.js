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
      'node_modules', '.git', 'staging_deploy', 'scratch', '.vercel', '_next', '.next/cache'
    ];

    // Include ONLY the Prisma client (without the huge engines folder)
    // The engines will be generated/downloaded on the server via 'prisma generate'
    const prismaClientPath = path.join(projectDir, 'node_modules/@prisma/client');
    if (fs.existsSync(prismaClientPath)) {
      console.log('Adding Prisma client (library)...');
      archive.directory(prismaClientPath, 'node_modules/@prisma/client');
    }

    files.forEach(file => {
      // Exclude zips, logs, and other non-essential files
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
        console.log(`Adding directory: ${file}`);
        archive.directory(fullPath, file, (entry) => {
          if (entry.name.includes('/cache/') || entry.name.includes('\\cache\\') || entry.name.endsWith('/cache') || entry.name.endsWith('\\cache')) {
            return false;
          }
          return entry;
        });
      } else {
        console.log(`Adding file: ${file}`);
        archive.file(fullPath, { name: file });
      }
    });

    archive.finalize();
  });
}

createZip().catch(console.error);
