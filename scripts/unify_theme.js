const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;
      
      // Replace Teal/Cyan with Gold
      content = content.replace(/#1089A4/gi, '#C5A021');
      // Replace Dark Teal with Slate Dark
      content = content.replace(/#021D24/gi, '#0F172A');
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Unified theme in:', fullPath);
      }
    }
  }
}

replaceInDir(path.join(__dirname, '../src/components'));
replaceInDir(path.join(__dirname, '../src/app'));
