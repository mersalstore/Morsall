const fs = require('fs');
const path = require('path');

const scratchDir = 'C:/Users/hazem/Downloads/matger2/scratch';

try {
  const files = ['view_page_151.txt', 'view_page_21.txt', 'view_page_464.txt'];
  files.forEach(f => {
    const fullPath = path.join(scratchDir, f);
    if (fs.existsSync(fullPath)) {
      console.log(`\n=== FILE: ${f} ===`);
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.includes('resLogisticsOrders') || line.includes('logisticsOrders')) {
          const start = Math.max(0, idx - 3);
          const end = Math.min(lines.length - 1, idx + 4);
          console.log(lines.slice(start, end).join('\n'));
        }
      });
    }
  });
} catch(err) {
  console.error(err);
}
