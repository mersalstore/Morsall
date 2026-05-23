const fs = require('fs');
const path = require('path');
const http = require('http');

const logFile = path.join(__dirname, 'test_start.txt');
fs.writeFileSync(logFile, `STARTED AT ${new Date().toISOString()}\n`);

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('STILL WORKING - DEBUG MODE\n');
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  fs.appendFileSync(logFile, `LISTENING ON ${port}\n`);
});
