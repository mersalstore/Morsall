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
          if (tc.name === 'write_to_file' && tc.args.TargetFile.includes('page.tsx')) {
            console.log(`Step ${obj.step_index} (Line ${idx}): write_to_file. CodeContent length = ${tc.args.CodeContent?.length}`);
          }
          if (tc.name === 'replace_file_content' && tc.args.TargetFile.includes('page.tsx')) {
            console.log(`Step ${obj.step_index} (Line ${idx}): replace_file_content. ReplacementContent length = ${tc.args.ReplacementContent?.length}`);
          }
        });
      }
    } catch(e) {}
  });
} catch(err) {
  console.error(err);
}
