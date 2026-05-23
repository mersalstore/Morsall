const fs = require('fs');

try {
  const content = fs.readFileSync('C:/Users/hazem/Downloads/matger2/scratch/view_page_151.txt', 'utf8');
  const lines = content.split('\n');
  
  // Let's find line numbers in the file.
  // The file has lines starting with line numbers, e.g., "154: ..."
  const targetLines = lines.filter(l => {
    const match = l.match(/^(\d+):/);
    if (match) {
      const lineNum = parseInt(match[1]);
      return lineNum >= 150 && lineNum <= 190;
    }
    return false;
  });
  
  console.log(targetLines.join('\n'));
} catch (err) {
  console.error(err);
}
