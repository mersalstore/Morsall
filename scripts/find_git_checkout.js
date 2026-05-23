const fs = require('fs');
const transcriptPath = 'C:/Users/hazem/.gemini/antigravity/brain/71806e8f-476e-472a-8d31-e8b36a544a34/.system_generated/logs/transcript.jsonl';

try {
  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, idx) => {
    try {
      const obj = JSON.parse(line);
      if (obj.tool_calls) {
        obj.tool_calls.forEach(tc => {
          if (tc.name === 'run_command' && (tc.args.CommandLine.includes('git ') || tc.args.CommandLine.includes('checkout'))) {
            console.log(`Step ${obj.step_index} (Line ${idx}): ${tc.args.CommandLine}`);
          }
        });
      }
    } catch(e) {}
  });
} catch(err) {
  console.error(err);
}
