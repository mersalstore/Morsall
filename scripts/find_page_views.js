const fs = require('fs');
const transcriptPath = 'C:/Users/hazem/.gemini/antigravity/brain/71806e8f-476e-472a-8d31-e8b36a544a34/.system_generated/logs/transcript.jsonl';

try {
  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, idx) => {
    if (line.includes('VIEW_FILE') && line.includes('page.tsx')) {
      try {
        const obj = JSON.parse(line);
        console.log(`Line ${idx}: type=${obj.type}, status=${obj.status}`);
        if (obj.content) {
          console.log(`  Content Length: ${obj.content.length}`);
          // Let's write the first 100 characters to see if it's the dashboard source
          console.log(`  Snippet: ${obj.content.slice(0, 150)}`);
          fs.writeFileSync(`C:/Users/hazem/Downloads/matger2/scratch/view_page_${idx}.txt`, obj.content);
          console.log(`  Saved to scratch/view_page_${idx}.txt`);
        }
      } catch(e) {}
    }
  });
} catch(err) {
  console.error(err);
}
