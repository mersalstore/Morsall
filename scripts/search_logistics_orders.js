const fs = require('fs');
const path = require('path');

const scratchDir = 'C:/Users/hazem/Downloads/matger2/scratch';

try {
  const files = fs.readdirSync(scratchDir);
  files.forEach(f => {
    const fullPath = path.join(scratchDir, f);
    const stat = fs.statSync(fullPath);
    if (stat.isFile()) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('resLogisticsOrders') || content.includes('logisticsOrders')) {
        console.log(`Found reference in file: ${f}`);
      }
    }
  });
} catch(err) {
  console.error(err);
}
