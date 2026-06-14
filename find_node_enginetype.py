import paramiko, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('82.198.228.182', port=65002, username='u754458241', password='Vixcell.eg2', timeout=20)

def run(cmd):
    _, stdout, stderr = client.exec_command(cmd, timeout=60)
    return (stdout.read() + stderr.read()).decode('utf-8', errors='replace').strip()

NODEJS = '/home/u754458241/domains/morsall.com/nodejs'

# Find node binary
print('=== Finding node binary ===')
print(run('find / -name "node" -type f -perm /111 2>/dev/null | grep -v proc | head -10'))

print()
print('=== nvm check ===')
print(run('ls ~/.nvm/versions/node/ 2>/dev/null; ls /usr/local/nvm/versions/node/ 2>/dev/null'))

print()
# The real issue: check what the index.js actually says about engineType
print('=== index.js engineType value (first 5 matches) ===')
print(run(f"grep -n 'engineType' {NODEJS}/node_modules/.prisma/client/index.js 2>&1 | head -10"))

print()
print('=== client.js engineType ===')
print(run(f"grep -n 'engineType' {NODEJS}/node_modules/.prisma/client/client.js 2>&1 | head -10"))

client.close()
