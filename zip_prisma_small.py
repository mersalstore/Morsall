"""
Create a SMALL prisma client zip with only the runtime JS/TS files
(not the heavy .so.node binary engines — those are already on the server).
"""
import os
import zipfile

src_dir = os.path.join("node_modules", ".prisma", "client")
out = "prisma_small.zip"

with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for root, _, files in os.walk(src_dir):
        for f in files:
            full = os.path.join(root, f)
            # Skip large binary engines and .so.node files
            if f.endswith('.so.node') or 'query-engine-' in f:
                continue
            # Skip Windows DLL/exe
            if f.endswith('.exe') or '.tmp' in f:
                continue
            rel = os.path.relpath(full, "node_modules")
            z.write(full, rel)

size_mb = os.path.getsize(out) / 1024 / 1024
print(f"Created {out} ({size_mb:.2f} MB)")

# List contents for verification
with zipfile.ZipFile(out, 'r') as z:
    names = z.namelist()
    print(f"Files: {len(names)}")
    for n in names[:20]:
        print(f"  {n}")
    if len(names) > 20:
        print(f"  ... and {len(names) - 20} more")
