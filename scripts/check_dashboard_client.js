const fs = require('fs');

try {
  const content = fs.readFileSync('C:/Users/hazem/Downloads/matger2/src/app/admin/dashboard/DashboardClient.tsx', 'utf8');
  const lines = content.split('\n');
  console.log('Total lines:', lines.length);
  
  console.log('--- START LINES (1-40) ---');
  console.log(lines.slice(0, 40).join('\n'));
  
  console.log('--- END TAB RENDERING LINES ---');
  // Find where tab rendering starts
  const tabStartIdx = lines.findIndex(l => l.includes('activeTab === "overview"'));
  if (tabStartIdx !== -1) {
    console.log(lines.slice(tabStartIdx, tabStartIdx + 80).join('\n'));
  }
} catch (err) {
  console.error(err);
}
