const fs = require('fs');
const transcriptPath = 'C:/Users/hazem/.gemini/antigravity/brain/71806e8f-476e-472a-8d31-e8b36a544a34/.system_generated/logs/transcript.jsonl';

try {
  const content = fs.readFileSync(transcriptPath, 'utf8');
  const lines = content.split('\n');
  const obj = JSON.parse(lines[101]);
  console.log('Keys:', Object.keys(obj));
  console.log('Type:', obj.type);
  if (obj.tool_calls) {
    console.log('Tool Calls:', JSON.stringify(obj.tool_calls, null, 2));
  }
  // Let's check line 102 (which is usually the system/tool response for line 101's call)
  const respObj = JSON.parse(lines[102]);
  console.log('Response Type:', respObj.type);
  if (respObj.content) {
    console.log('Response Content Length:', respObj.content.length);
    fs.writeFileSync('C:/Users/hazem/Downloads/matger2/scratch/line_102_content.txt', respObj.content);
    console.log('Saved response content to scratch/line_102_content.txt');
  }
} catch (e) {
  console.error(e);
}
