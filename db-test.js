const { createServer } = require('http');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Force binary
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'binary';
process.env.PRISMA_QUERY_ENGINE_BINARY = '/home/u754458241/domains/morsall.com/nodejs/node_modules/.prisma/client/query-engine-rhel-openssl-3.0.x';

const prisma = new PrismaClient();

createServer(async (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  try {
    const count = await prisma.product.count();
    res.end(`SUCCESS! Product count: ${count}`);
  } catch (err) {
    res.end(`FAILURE: ${err.message}\n\nStack: ${err.stack}`);
  }
}).listen(process.env.PORT || 3000);
