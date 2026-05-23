const fs = require('fs');
const transcriptPath = 'C:/Users/hazem/.gemini/antigravity/brain/71806e8f-476e-472a-8d31-e8b36a544a34/.system_generated/logs/transcript.jsonl';

try {
  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, idx) => {
    try {
      const obj = JSON.parse(line);
      // Look in tool calls
      if (obj.tool_calls) {
        obj.tool_calls.forEach(tc => {
          if (tc.name === 'view_file' && tc.args.AbsolutePath.includes('page.tsx')) {
            console.log(`Step ${obj.step_index} (Line ${idx}): VIEW_FILE args =`, JSON.stringify(tc.args));
          }
        });
      }
      // Look in responses
      if (obj.type === 'VIEW_FILE' && obj.content && obj.content.includes('page.tsx')) {
        console.log(`Step ${obj.step_index} (Line ${idx}): VIEW_FILE response length = ${obj.content.length}`);
      }
    } catch(e) {}
  });
} catch(err) {
  console.error(err);
}
