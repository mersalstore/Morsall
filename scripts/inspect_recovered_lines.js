const fs = require('fs');
const path = require('path');

const scratchDir = 'C:/Users/hazem/Downloads/matger2/scratch';

try {
  const files = fs.readdirSync(scratchDir).filter(f => f.startsWith('view_page_'));
  files.forEach(f => {
    const fullPath = path.join(scratchDir, f);
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    const showingLinesLine = lines.find(l => l.includes('Showing lines'));
    const totalLinesLine = lines.find(l => l.includes('Total Lines:'));
    console.log(`File: ${f} | ${totalLinesLine ? totalLinesLine.trim() : ''} | ${showingLinesLine ? showingLinesLine.trim() : ''}`);
  });
} catch (err) {
  console.error(err);
}
