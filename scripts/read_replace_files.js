const fs = require('fs');

const files = [
  'C:/Users/hazem/Downloads/matger2/scratch/full_replace_154_0.txt',
  'C:/Users/hazem/Downloads/matger2/scratch/full_replace_158_0.txt',
  'C:/Users/hazem/Downloads/matger2/scratch/full_replace_162_0.txt'
];

files.forEach(f => {
  console.log(`\n=== FILE: ${f} ===`);
  if (fs.existsSync(f)) {
    console.log(fs.readFileSync(f, 'utf8'));
  } else {
    console.log('File does not exist');
  }
});
