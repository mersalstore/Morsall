const fs = require('fs');
const transcriptPath = 'C:/Users/hazem/.gemini/antigravity/brain/71806e8f-476e-472a-8d31-e8b36a544a34/.system_generated/logs/transcript.jsonl';

try {
  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.split('\n');
  
  const indices = [154, 158, 162, 168];
  indices.forEach(idx => {
    try {
      const obj = JSON.parse(lines[idx]);
      if (obj.tool_calls) {
        obj.tool_calls.forEach((tc, tcIdx) => {
          if (tc.args && tc.args.ReplacementContent) {
            const outPath = `C:/Users/hazem/Downloads/matger2/scratch/full_replace_${idx}_${tcIdx}.txt`;
            fs.writeFileSync(outPath, tc.args.ReplacementContent);
            console.log(`Saved full ReplacementContent for line ${idx} to ${outPath}`);
          }
          if (tc.args && tc.args.TargetContent) {
            const outPath = `C:/Users/hazem/Downloads/matger2/scratch/full_target_${idx}_${tcIdx}.txt`;
            fs.writeFileSync(outPath, tc.args.TargetContent);
            console.log(`Saved full TargetContent for line ${idx} to ${outPath}`);
          }
        });
      }
    } catch (e) {
      console.error(`Error processing line ${idx}:`, e.message);
    }
  });
} catch(err) {
  console.error(err);
}
