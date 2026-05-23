const fs = require('fs');
const path = require('path');

const brainDir = 'C:/Users/hazem/.gemini/antigravity/brain';
console.log('Searching in:', brainDir);

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDir(fullPath);
    } else if (file === 'transcript.jsonl') {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('ImportedOrdersTab') && content.includes('WarehouseTab')) {
          console.log('✨ Found match in transcript:', fullPath);
          
          // Let's find the lines with the code content
          const lines = content.split('\n');
          lines.forEach((line, idx) => {
            if (line.includes('ImportedOrdersTab') && line.includes('WarehouseTab')) {
              console.log(`Line ${idx} matches! Length:`, line.length, 'Snippet:', line.slice(0, 150));
              try {
                const obj = JSON.parse(line);
                if (obj.tool_calls) {
                  obj.tool_calls.forEach(tc => {
                    console.log('Tool call name:', tc.name);
                    if (tc.args && tc.args.CodeContent) {
                      fs.writeFileSync('C:/Users/hazem/Downloads/matger2/scratch/recovered_page.txt', tc.args.CodeContent);
                      console.log('✅ Recovered page code saved!');
                    }
                  });
                }
              } catch(e) {
                console.log('JSON parse error:', e.message);
              }
            }
          });
        }
      } catch (err) {
        // ignore read errors
      }
    }
  }
}

try {
  searchDir(brainDir);
  console.log('Search finished.');
} catch (err) {
  console.error(err);
}
