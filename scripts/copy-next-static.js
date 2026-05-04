/**
 * Hostinger + LiteSpeed: HTML يشير إلى /assets/_next/static/ والـ .htaccess يخدم من _next/static/
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const src = path.join(root, ".next", "static");
const dest = path.join(root, "_next", "static");

if (!fs.existsSync(src)) {
  console.error("[copy-next-static] Missing .next/static — run: npm run build");
  process.exit(1);
}

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.cpSync(src, dest, { recursive: true });
console.log("[copy-next-static] OK:", dest);
