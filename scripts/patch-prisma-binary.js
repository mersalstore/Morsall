#!/usr/bin/env node
/**
 * Forces the generated Prisma client to use the BINARY engine instead of LIBRARY.
 * Run after `prisma generate` (or every build). Workaround for Prisma 6.2.1 not
 * fully honoring `engineType = "binary"` in the schema generator config.
 */
const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, '..', 'node_modules', '.prisma', 'client');
const indexPath = path.join(clientDir, 'index.js');

if (!fs.existsSync(indexPath)) {
  console.error('[patch-prisma-binary] index.js not found at:', indexPath);
  process.exit(0);
}

let content = fs.readFileSync(indexPath, 'utf-8');
let changes = 0;

// Replace the runtime require
const newContent = content.replace(
  /require\('@prisma\/client\/runtime\/library\.js'\)/g,
  () => { changes++; return `require('@prisma/client/runtime/binary.js')`; }
);

// Also fix the embedded engineType config
const finalContent = newContent.replace(
  /"engineType":\s*"library"/g,
  () => { changes++; return '"engineType": "binary"'; }
);

if (changes === 0) {
  console.log('[patch-prisma-binary] No "library" references found; nothing to patch.');
} else {
  fs.writeFileSync(indexPath, finalContent);
  console.log(`[patch-prisma-binary] Patched ${changes} reference(s) library → binary in ${indexPath}`);
}
