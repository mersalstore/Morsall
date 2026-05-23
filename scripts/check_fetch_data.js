const fs = require('fs');

try {
  const content = fs.readFileSync('C:/Users/hazem/Downloads/matger2/src/app/admin/dashboard/DashboardClient.tsx', 'utf8');
  const lines = content.split('\n');
  console.log(lines.slice(120, 200).join('\n'));
} catch (err) {
  console.error(err);
}
