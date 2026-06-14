import paramiko, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('82.198.228.182', port=65002, username='u754458241', password='Vixcell.eg2', timeout=20)

def run(cmd):
    _, stdout, stderr = client.exec_command(cmd, timeout=30)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    return (out + err).strip()

print('=== Prisma .prisma/client engineType ===')
r = run("grep -o 'engineType:[^,}]*' /home/u754458241/domains/morsall.com/nodejs/node_modules/.prisma/client/default.js 2>&1 | head -3")
print(r or '(empty)')

print()
print('=== Binary engines present ===')
r = run('ls /home/u754458241/domains/morsall.com/nodejs/node_modules/.prisma/client/ 2>&1 | grep -E "query|engine"')
print(r or '(none)')

print()
print('=== @prisma/client engineType ===')
r = run("grep -o 'engineType:[^,}]*' /home/u754458241/domains/morsall.com/nodejs/node_modules/@prisma/client/default.js 2>&1 | head -3")
print(r or '(empty)')

print()
print('=== .next delivery-zones route engineType ===')
r = run("grep -o 'engineType:[^,}]*' /home/u754458241/domains/morsall.com/nodejs/.next/server/app/api/delivery-zones/route.js 2>&1 | head -3")
print(r or '(empty)')

client.close()
print('\nDONE')
