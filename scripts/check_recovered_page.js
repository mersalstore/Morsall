const fs = require('fs');

const files = [
  'C:/Users/hazem/Downloads/matger2/scratch/recovered_page.txt',
  'C:/Users/hazem/Downloads/matger2/scratch/recovered_content.txt'
];

files.forEach(f => {
  console.log(`=== FILE: ${f} ===`);
  if (fs.existsSync(f)) {
    const content = fs.readFileSync(f, 'utf8');
    const lines = content.split('\n');
    console.log(`Exists! Line count: ${lines.length}, Content length: ${content.length}`);
    console.log('First 10 lines:');
    console.log(lines.slice(0, 10).join('\n'));
    console.log('Last 10 lines:');
    console.log(lines.slice(-10).join('\n'));
  } else {
    console.log('Does not exist');
  }
});
