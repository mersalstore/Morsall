"""
Create ONE combined zip with:
- All app files (src, .next, etc.)
- Prisma client JS files at node_modules/.prisma/client/* (without huge .so.node binaries)
The PHP unzip will extract everything to nodejs/ in one shot.
"""
import os
import zipfile

out = "fast_update.zip"
print(f"Creating {out}...")

with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    # App dirs
    dirs_to_zip = ['.next', '_next', 'src', 'public', 'prisma']
    files_to_zip = ['server.js', 'server-hostinger.js', 'package.json', 'next.config.js']

    for d in dirs_to_zip:
        if not os.path.exists(d):
            continue
        for root, _, files in os.walk(d):
            if '.next' in d and 'cache' in root:
                continue
            if 'semantic' in root:
                continue
            for file in files:
                if 'semantic' in file:
                    continue
                full = os.path.join(root, file)
                rel = os.path.join(d, os.path.relpath(full, d))
                z.write(full, rel)

    for f in files_to_zip:
        if os.path.exists(f):
            z.write(f, f)

    # Prisma client (small): only the JS/TS files at node_modules/.prisma/client/
    prisma_dir = os.path.join("node_modules", ".prisma", "client")
    if os.path.exists(prisma_dir):
        for root, _, files in os.walk(prisma_dir):
            for f in files:
                # Skip heavy binaries
                if f.endswith('.so.node') or f.startswith('query-engine-') or f.startswith('query_engine-'):
                    continue
                if f.endswith('.exe') or '.tmp' in f or f.endswith('.dll.node'):
                    continue
                full = os.path.join(root, f)
                # Path inside zip: node_modules/.prisma/client/<file>
                rel = os.path.relpath(full, ".")
                z.write(full, rel)

size_mb = os.path.getsize(out) / 1024 / 1024
print(f"Created {out} ({size_mb:.2f} MB)")
