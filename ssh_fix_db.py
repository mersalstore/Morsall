import paramiko
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = '82.198.228.182'
PORT = 65002
USER = 'u754458241'
PASS = 'Vixcell.eg2'

NODEJS_DIR = '/home/u754458241/domains/morsall.com/nodejs'
NODE_BIN = '/opt/alt/alt-nodejs20/root/usr/bin/node'

def run(client, cmd, timeout=300):
    print(f"$ {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    if out: print(out)
    if err: print(f"STDERR: {err}")
    return out, err

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
print("CONNECTED\n")

# Use a tiny Node script to talk to MySQL via the existing @prisma/client (no separate mysql client needed)
diag_js = '''
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({ select: { id: true, name: true, slug: true } });
    console.log("Plans count:", plans.length);
    for (const p of plans) {
      console.log("  id=" + p.id + " name=" + p.name + " slug=" + p.slug);
    }
  } catch (e) {
    console.log("ERROR:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
'''

print("\n=== DUMP CURRENT PLANS ===")
# Write the script to remote
sftp = client.open_sftp()
with sftp.open(f'{NODEJS_DIR}/_diag_plans.js', 'w') as f:
    f.write(diag_js)
sftp.close()

run(client, f'cd {NODEJS_DIR} && {NODE_BIN} _diag_plans.js')

# Clean
run(client, f'rm -f {NODEJS_DIR}/_diag_plans.js')

client.close()
print("\nDONE")
