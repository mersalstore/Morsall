const fs = require('fs');

const files = [
  'C:/Users/hazem/Downloads/matger2/scratch/view_page_460.txt',
  'C:/Users/hazem/Downloads/matger2/scratch/view_page_464.txt',
  'C:/Users/hazem/Downloads/matger2/scratch/view_page_468.txt'
];

files.forEach(f => {
  console.log(`=== FILE: ${f} ===`);
  if (fs.existsSync(f)) {
    const content = fs.readFileSync(f, 'utf8');
    console.log(content.slice(0, 1000));
  } else {
    console.log('File does not exist');
  }
});
