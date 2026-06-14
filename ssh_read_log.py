import paramiko
import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = '82.198.228.182'
PORT = 65002
USER = 'u754458241'
PASS = 'Vixcell.eg2'

NODEJS_DIR = '/home/u754458241/domains/morsall.com/nodejs'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
print("CONNECTED")

def redact(s):
    s = re.sub(r'mysql://[^@\s]+@[^\s/]+', 'mysql://[REDACTED]@host', s)
    s = re.sub(r'DATABASE_URL\s*=\s*\S+', 'DATABASE_URL=[REDACTED]', s)
    return s

# Find latest log files
print("\n=== Available log files ===")
stdin, stdout, stderr = client.exec_command(f'ls -lat {NODEJS_DIR}/*.log {NODEJS_DIR}/stderr.log 2>/dev/null | head -10', timeout=30)
print(stdout.read().decode('utf-8', errors='ignore'))

# Read the most relevant log — server.log
print("\n=== server.log tail (last 80 lines, redacted) ===")
stdin, stdout, stderr = client.exec_command(f'tail -100 {NODEJS_DIR}/server.log 2>/dev/null | head -80', timeout=30)
out = stdout.read().decode('utf-8', errors='ignore')
print(redact(out))

print("\n=== stderr.log tail (last 80 lines, redacted) ===")
stdin, stdout, stderr = client.exec_command(f'tail -100 {NODEJS_DIR}/stderr.log 2>/dev/null | head -80', timeout=30)
out = stdout.read().decode('utf-8', errors='ignore')
print(redact(out))

# Test admin/inventory via direct prisma node script — count products
test_js = '''
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const p = await prisma.product.count();
    const v = await prisma.vendor.count();
    const u = await prisma.user.count();
    const c = await prisma.category.count();
    console.log("Product count:", p);
    console.log("Vendor count:", v);
    console.log("User count:", u);
    console.log("Category count:", c);

    // Sample 1 product
    const sample = await prisma.product.findFirst({ select: { id: true, title: true, status: true, vendorId: true } });
    console.log("Sample product:", JSON.stringify(sample));
  } catch (e) {
    console.log("ERROR:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
'''

sftp = client.open_sftp()
with sftp.open(f'{NODEJS_DIR}/_test_counts.js', 'w') as f:
    f.write(test_js)
sftp.close()

print("\n=== Test Prisma counts via Node ===")
stdin, stdout, stderr = client.exec_command(f'cd {NODEJS_DIR} && /opt/alt/alt-nodejs20/root/usr/bin/node _test_counts.js 2>&1', timeout=60)
out = stdout.read().decode('utf-8', errors='ignore')
print(redact(out))

# cleanup
client.exec_command(f'rm -f {NODEJS_DIR}/_test_counts.js', timeout=10).__class__

client.close()
print("\nDONE")
