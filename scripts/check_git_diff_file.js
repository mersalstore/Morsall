const fs = require('fs');

try {
  const content = fs.readFileSync('C:/Users/hazem/Downloads/matger2/scratch/git_diff_output.txt', 'utf8');
  const lines = content.split('\n');
  console.log('Total lines in diff file:', lines.length);
  console.log('First 50 lines:');
  console.log(lines.slice(0, 50).join('\n'));
} catch (err) {
  console.error(err);
}
