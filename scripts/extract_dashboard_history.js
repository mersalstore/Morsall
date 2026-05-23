const fs = require('fs');
const path = require('path');

const transcriptPath = 'C:/Users/hazem/.gemini/antigravity/brain/71806e8f-476e-472a-8d31-e8b36a544a34/.system_generated/logs/transcript.jsonl';

try {
  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.split('\n');
  
  const lineIndices = [];
  lines.forEach((line, idx) => {
    if (line.includes('WarehouseTab')) {
      lineIndices.push(idx);
    }
  });
  
  lineIndices.forEach(idx => {
    if (idx < lines.length) {
      try {
        const obj = JSON.parse(lines[idx]);
        console.log(`--- LINE ${idx} (Type: ${obj.type}, Status: ${obj.status}) ---`);
        
        // Check if this step was a write_to_file or a tool call containing page.tsx content
        if (obj.tool_calls) {
          obj.tool_calls.forEach(tc => {
            console.log(`Tool Call: ${tc.name}`);
            if (tc.args && tc.args.CodeContent) {
              console.log('CodeContent found! Length:', tc.args.CodeContent.length);
              fs.writeFileSync(`C:/Users/hazem/Downloads/matger2/scratch/extracted_code_${idx}.txt`, tc.args.CodeContent);
              console.log(`Saved to scratch/extracted_code_${idx}.txt`);
            }
          });
        }
        
        if (obj.content && obj.content.includes('page.tsx')) {
          console.log('Content snippet:', obj.content.slice(0, 500));
        }
      } catch (e) {
        console.log(`Error parsing line ${idx}:`, e.message);
      }
    }
  });
  
} catch (err) {
  console.error('Error:', err);
}
