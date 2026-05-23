const fs = require('fs');
const transcriptPath = 'C:/Users/hazem/.gemini/antigravity/brain/71806e8f-476e-472a-8d31-e8b36a544a34/.system_generated/logs/transcript.jsonl';

try {
  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.split('\n');
  
  const indices = [154, 158, 162, 168];
  indices.forEach(idx => {
    const obj = JSON.parse(lines[idx]);
    console.log(`=== LINE ${idx} ===`);
    if (obj.tool_calls) {
      obj.tool_calls.forEach(tc => {
        console.log(`Tool: ${tc.name}`);
        console.log(`Args:`, JSON.stringify(tc.args, null, 2));
      });
    }
  });
} catch(err) {
  console.error(err);
}
