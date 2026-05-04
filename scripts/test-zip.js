const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

const output = fs.createWriteStream(path.join(__dirname, '../test.zip'));
const archive = archiver('zip');

output.on('close', () => console.log('Done'));
archive.pipe(output);
archive.append('test', { name: 'test.txt' });
archive.finalize();
