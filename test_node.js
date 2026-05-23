const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('NODE.JS IS WORKING!\n' + new Date().toISOString());
});
server.listen(process.env.PORT || 3000);
console.log('Test server running');
