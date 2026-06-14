import paramiko
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = '82.198.228.182'
PORT = 65002
USER = 'u754458241'
PASS = 'Vixcell.eg2'

NODEJS_DIR = '/home/u754458241/domains/morsall.com/nodejs'
NODE_BIN = '/opt/alt/alt-nodejs20/root/usr/bin/node'

def run(client, cmd, timeout=600):
    print(f"$ {cmd[:200]}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    return out, err

def safe_print(s, max_chars=4000):
    """Print without exposing potential secrets - filter mysql:// URLs from output"""
    import re
    s = re.sub(r'mysql://[^@]+@[^/]+/\S*', 'mysql://[REDACTED]', s)
    s = re.sub(r'DATABASE_URL=\S+', 'DATABASE_URL=[REDACTED]', s)
    if len(s) > max_chars:
        s = s[:max_chars] + "\n... [truncated]"
    print(s)

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
print("CONNECTED\n")

# Step 1: Run a Node script via Prisma that fixes NULL slugs IF any
fix_slugs_js = '''
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      select: { id: true, name: true, slug: true }
    });
    console.log("Total plans:", plans.length);

    let fixedCount = 0;
    for (const p of plans) {
      if (!p.slug || p.slug.trim() === "") {
        const newSlug = "legacy-" + p.id.substring(0, 8) + "-" + Date.now() + Math.floor(Math.random() * 1000);
        await prisma.subscriptionPlan.update({
          where: { id: p.id },
          data: { slug: newSlug },
        });
        console.log("Fixed NULL slug for plan id=" + p.id + ": " + newSlug);
        fixedCount++;
      }
    }
    console.log("Fixed:", fixedCount, "plans");
    console.log("DONE");
  } catch (e) {
    console.error("ERROR:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
'''

print("=== Step 1: Fix NULL slugs (via Prisma) ===")
sftp = client.open_sftp()
with sftp.open(f'{NODEJS_DIR}/_fix_slugs.js', 'w') as f:
    f.write(fix_slugs_js)
sftp.close()

out, err = run(client, f'cd {NODEJS_DIR} && {NODE_BIN} _fix_slugs.js 2>&1', timeout=180)
safe_print(out + err)

# Cleanup
run(client, f'rm -f {NODEJS_DIR}/_fix_slugs.js')

# Step 2: Run prisma db push
print("\n=== Step 2: prisma db push (creates missing tables) ===")
out, err = run(client, f'cd {NODEJS_DIR} && {NODE_BIN} ./node_modules/prisma/build/index.js db push --skip-generate 2>&1', timeout=600)
safe_print(out + err, 8000)

# Step 3: Trigger restart
print("\n=== Step 3: Touch restart.txt ===")
run(client, f'mkdir -p {NODEJS_DIR}/tmp && touch {NODEJS_DIR}/tmp/restart.txt && echo OK')

client.close()
print("\nDONE")
