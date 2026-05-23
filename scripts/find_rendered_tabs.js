const fs = require('fs');
const transcriptPath = 'C:/Users/hazem/.gemini/antigravity/brain/71806e8f-476e-472a-8d31-e8b36a544a34/.system_generated/logs/transcript.jsonl';

try {
  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, idx) => {
    if (line.includes('activeTab === "wms"') || line.includes('activeTab === "importedOrders"')) {
      console.log(`Line ${idx} contains match!`);
      // print snippet
      console.log(line.slice(line.indexOf('activeTab ==='), line.indexOf('activeTab ===') + 200));
    }
  });
} catch (err) {
  console.error(err);
}
