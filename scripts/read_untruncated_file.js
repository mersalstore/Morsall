const fs = require('fs');

const files = [
  'C:/Users/hazem/Downloads/matger2/scratch/view_page_624.txt', // lines 1 to 30
  'C:/Users/hazem/Downloads/matger2/scratch/view_page_468.txt', // lines 25 to 55
  'C:/Users/hazem/Downloads/matger2/scratch/view_page_464.txt', // lines 60 to 90
  'C:/Users/hazem/Downloads/matger2/scratch/view_page_460.txt', // lines 190 to 250
  'C:/Users/hazem/Downloads/matger2/scratch/view_page_585.txt', // lines 255 to 290
  'C:/Users/hazem/Downloads/matger2/scratch/view_page_171.txt'  // lines 410 to 465
];

files.forEach(f => {
  console.log(`\n======================================================`);
  console.log(`=== FILE: ${f} ===`);
  console.log(`======================================================`);
  if (fs.existsSync(f)) {
    console.log(fs.readFileSync(f, 'utf8'));
  } else {
    console.log('File does not exist');
  }
});
