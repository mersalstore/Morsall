const { createServer } = require('http');
const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, 'root_test.log');
fs.writeFileSync(logPath, 'ROOT NODE START: ' + new Date().toISOString() + '\n');

createServer((req, res) => {
  fs.appendFileSync(logPath, 'REQ: ' + req.url + '\n');
  res.end('ROOT_NODE_ALIVE');
}).listen(process.env.PORT || 3000);
