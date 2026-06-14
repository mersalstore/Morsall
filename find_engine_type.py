import paramiko, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('82.198.228.182', port=65002, username='u754458241', password='Vixcell.eg2', timeout=20)

def run(cmd):
    _, stdout, stderr = client.exec_command(cmd, timeout=60)
    return (stdout.read() + stderr.read()).decode('utf-8', errors='replace').strip()

NODEJS = '/home/u754458241/domains/morsall.com/nodejs'

print('=== Files in .prisma/client ===')
print(run(f'ls {NODEJS}/node_modules/.prisma/client/ 2>&1 | grep -v ".so.node" | grep -v "query-engine" | grep -v ".wasm"'))

print()
print('=== Search engineType in all .prisma/client JS files ===')
print(run(f"grep -rl 'engineType' {NODEJS}/node_modules/.prisma/client/ 2>&1 | head -5"))

print()
print('=== Search engineType in index.js ===')
print(run(f"grep -o 'engineType[^,\"}}]*' {NODEJS}/node_modules/.prisma/client/index.js 2>&1 | head -5"))

print()
print('=== Search in wasm file ref ===')
print(run(f"grep -o 'engineType[^,\"}}]*' {NODEJS}/node_modules/.prisma/client/wasm.js 2>&1 | head -5"))

print()
# The real issue - what does the bundled .next say?
print('=== engineType in .next bundle (delivery-zones) ===')
print(run(f"strings {NODEJS}/.next/server/app/api/delivery-zones/route.js 2>/dev/null | grep -i 'enginetype' | head -5"))

print()
# Check if we need to run prisma generate on the server side  
print('=== Can we find node binary? ===')
print(run('find /usr/local -name "node" -type f 2>/dev/null | head -3; ls /usr/local/bin/ 2>/dev/null | grep node | head -5'))

print()
print('=== Check NODE_PATH or nvm ===')
print(run('ls /home/u754458241/.nvm/versions/node/ 2>/dev/null | head -5; echo PATH=$PATH'))

client.close()
