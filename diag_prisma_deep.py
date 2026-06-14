import paramiko, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('82.198.228.182', port=65002, username='u754458241', password='Vixcell.eg2', timeout=20)

def run(cmd):
    _, stdout, stderr = client.exec_command(cmd, timeout=60)
    return (stdout.read() + stderr.read()).decode('utf-8', errors='replace').strip()

NODEJS = '/home/u754458241/domains/morsall.com/nodejs'

# Check what engineType is embedded in the built .next files
print('=== engineType in .next/server/app/api/delivery-zones/route.js ===')
print(run(f"grep -o 'engineType:\"[^\"]*\"' {NODEJS}/.next/server/app/api/delivery-zones/route.js 2>&1 | head -3"))

print()
print('=== engineType in node_modules/.prisma/client/default.js ===')
print(run(f"grep -o 'engineType:\"[^\"]*\"' {NODEJS}/node_modules/.prisma/client/default.js 2>&1 | head -3"))

print()
print('=== @prisma/client package.json version ===')
print(run(f"cat {NODEJS}/node_modules/@prisma/client/package.json 2>&1 | grep -E '\"version\"|\"engineType\"' | head -5"))

print()
print('=== prisma schema on server ===')
print(run(f"head -10 {NODEJS}/prisma/schema.prisma 2>&1"))

# Check if there's a way to regenerate prisma on the server
print()
print('=== node/npx available ===')
print(run("which node 2>&1; node --version 2>&1; which npx 2>&1"))

client.close()
