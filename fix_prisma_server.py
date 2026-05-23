import paramiko
import sys
import os

if sys.stdout.encoding != 'utf-8':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

hostname = '82.198.228.182'
port = 65002
username = 'u754458241'
password = '@n9qe3KgL'

print(f"Connecting to {hostname}:{port}...")

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    client.connect(
        hostname, port=port, username=username, password=password,
        look_for_keys=False, allow_agent=False,
        auth_timeout=30, timeout=30
    )
    print("Connected!")
except Exception as e:
    print(f"Connection failed: {e}")
    sys.exit(1)

commands = [
    'echo "=== Connected ==="',
    'cd /home/u754458241/domains/morsall.com/nodejs && echo "=== In nodejs dir ==="',
    'cd /home/u754458241/domains/morsall.com/nodejs && export PATH=/opt/alt/alt-nodejs22/root/usr/bin:$PATH && node --version',
    'cd /home/u754458241/nodeapp && export PATH=/opt/alt/alt-nodejs22/root/usr/bin:$PATH && npm cache clean --force && rm -rf node_modules/@prisma node_modules/.prisma && npm install @prisma/client@6.2.1 prisma@6.2.1 2>&1 | tail -3',
    'cd /home/u754458241/domains/morsall.com/nodejs && export PATH=/opt/alt/alt-nodejs22/root/usr/bin:$PATH && npx prisma generate 2>&1 | tail -5',
    'cd /home/u754458241/domains/morsall.com/nodejs && mkdir -p tmp && touch tmp/restart.txt && echo "=== DONE ==="',
]

for cmd in commands:
    print(f"\n>>> Running: {cmd[:60]}...")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=120)
    out = stdout.read().decode('utf-8', errors='ignore').strip()
    err = stderr.read().decode('utf-8', errors='ignore').strip()
    if out:
        print(f"OUT: {out[:300]}")
    if err:
        print(f"ERR: {err[:300]}")

client.close()
print("\nDone!")
