const fs = require('fs');
const transcriptPath = 'C:/Users/hazem/.gemini/antigravity/brain/71806e8f-476e-472a-8d31-e8b36a544a34/.system_generated/logs/transcript.jsonl';

try {
  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.split('\n');
  
  const lineIdx = 647;
  if (lineIdx < lines.length) {
    const obj = JSON.parse(lines[lineIdx]);
    console.log(`Step ${obj.step_index}: Type = ${obj.type}, Status = ${obj.status}`);
    
    // Write the output to a text file
    fs.writeFileSync('C:/Users/hazem/Downloads/matger2/scratch/git_diff_output.txt', obj.content || '');
    console.log('Saved git diff output to scratch/git_diff_output.txt');
    console.log('First 500 chars of diff:');
    console.log((obj.content || '').slice(0, 500));
  } else {
    console.log('Line 647 does not exist');
  }
} catch(err) {
  console.error(err);
}
