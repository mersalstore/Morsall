const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

async function createPrismaZip() {
  const zipPath = path.join(__dirname, 'prisma_client.zip');
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    console.log('Archive created: ' + zipPath);
    process.exit(0);
  });
  
  archive.on('error', (err) => {
    console.error(err);
    process.exit(1);
  });
  
  archive.pipe(output);
  
  if (fs.existsSync('node_modules/@prisma/client')) {
    archive.directory('node_modules/@prisma/client/', 'node_modules/@prisma/client/');
  }
  if (fs.existsSync('node_modules/.prisma')) {
    archive.directory('node_modules/.prisma/', 'node_modules/.prisma/');
  }
  
  archive.finalize();
}

createPrismaZip();
