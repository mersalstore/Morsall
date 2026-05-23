const { createServer } = require('http');
const { parse } = require('url');
const path = require('path');
const fs = require('fs');

// Log to file
const logFile = fs.createWriteStream(path.join(__dirname, 'server.log'), { flags: 'a' });
process.stdout.write = process.stderr.write = logFile.write.bind(logFile);

console.log('--- RECOVERY V2 STARTING ---');

// SEARCH FOR node_modules
let nodeModulesPath = '';
const searchPaths = [
    path.join(__dirname, 'node_modules'),
    path.join(__dirname, 'app_new/node_modules'),
    '/home/u754458241/domains/morsall.com/nodejs/node_modules',
    '/home/u754458241/nodeapp/node_modules'
];

for (const p of searchPaths) {
    if (fs.existsSync(p)) {
        console.log('Found node_modules at:', p);
        nodeModulesPath = p;
        break;
    }
}

if (!nodeModulesPath) {
    console.error('CRITICAL: node_modules NOT FOUND ANYWHERE');
    process.exit(1);
}

process.env.PRISMA_CLIENT_ENGINE_TYPE = 'binary';
process.env.NODE_ENV = 'production';

process.env.NODE_PATH = [
  nodeModulesPath,
  path.join(nodeModulesPath, 'next/node_modules')
].join(path.delimiter);
require('module').Module._initPaths();

const next = require('next');
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('SERVER_ERROR:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(process.env.PORT || 3000);
});
