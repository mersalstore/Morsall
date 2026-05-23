const fs = require('fs');

try {
  const content = fs.readFileSync('C:/Users/hazem/Downloads/matger2/scratch/view_page_5.txt', 'utf8');
  console.log(content.slice(0, 1000));
} catch (err) {
  console.error(err);
}
