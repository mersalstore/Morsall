const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('HELLO FROM SIMPLE SERVER ' + new Date().toISOString());
}).listen(process.env.PORT || 3000);
console.log('Simple server started');
