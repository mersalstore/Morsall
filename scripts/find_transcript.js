const fs = require('fs');
const path = require('path');

const logDir = 'C:/Users/hazem/.gemini/antigravity/brain/71806e8f-476e-472a-8d31-e8b36a544a34/.system_generated/logs';
console.log('Log directory:', logDir);

try {
  if (fs.existsSync(logDir)) {
    const files = fs.readdirSync(logDir);
    console.log('Files in logDir:', files);
    
    const transcriptPath = path.join(logDir, 'transcript.jsonl');
    if (fs.existsSync(transcriptPath)) {
      console.log('Found transcript.jsonl. Reading...');
      const content = fs.readFileSync(transcriptPath, 'utf8');
      console.log('Transcript length:', content.length);
      
      const lines = content.split('\n');
      console.log('Total lines:', lines.length);
      
      let found = [];
      lines.forEach((line, idx) => {
        if (line.includes('WarehouseTab')) {
          found.push(idx);
        }
      });
      console.log('Found WarehouseTab in lines:', found);
      if (found.length > 0) {
        // Print the first match context
        const firstMatchLine = lines[found[0]];
        console.log('First match length:', firstMatchLine.length);
        // Let's write this line to a file for analysis
        fs.writeFileSync('C:/Users/hazem/Downloads/matger2/scratch/matched_line.txt', firstMatchLine);
        console.log('Saved first match to scratch/matched_line.txt');
      }
    } else {
      console.log('transcript.jsonl not found in logDir');
    }
  } else {
    console.log('Log directory does not exist');
  }
} catch (err) {
  console.error('Error occurred:', err);
}
