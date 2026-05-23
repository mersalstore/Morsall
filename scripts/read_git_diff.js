const fs = require('fs');
const transcriptPath = 'C:/Users/hazem/.gemini/antigravity/brain/71806e8f-476e-472a-8d31-e8b36a544a34/.system_generated/logs/transcript.jsonl';

try {
  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.split('\n');
  
  // Find step 798 or line 646
  // We can look at line 646 specifically, or scan for a step_index of 798 or 799 (since response is usually step+1)
  const lineIdx = 646;
  if (lineIdx < lines.length) {
    console.log(`Line 646 content snippet:`, lines[lineIdx].slice(0, 500));
    fs.writeFileSync('C:/Users/hazem/Downloads/matger2/scratch/git_diff_step_798.txt', lines[lineIdx]);
    console.log('Saved Line 646 to scratch/git_diff_step_798.txt');
  }
  
  // Let's also search for step_index 798 or 799 or 800
  lines.forEach((line, idx) => {
    try {
      const obj = JSON.parse(line);
      if (obj.step_index >= 797 && obj.step_index <= 802) {
        console.log(`Step ${obj.step_index} (Line ${idx}): Type = ${obj.type}, Status = ${obj.status}`);
        if (obj.content && obj.content.includes('diff')) {
          fs.writeFileSync(`C:/Users/hazem/Downloads/matger2/scratch/git_diff_step_${obj.step_index}.txt`, obj.content);
          console.log(`Saved step ${obj.step_index} content to scratch/git_diff_step_${obj.step_index}.txt`);
        }
      }
    } catch(e) {}
  });
} catch(err) {
  console.error(err);
}
