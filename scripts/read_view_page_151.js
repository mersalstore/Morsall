const fs = require('fs');

try {
  const content = fs.readFileSync('C:/Users/hazem/Downloads/matger2/scratch/view_page_151.txt', 'utf8');
  console.log(content);
} catch (err) {
  console.error(err);
}
