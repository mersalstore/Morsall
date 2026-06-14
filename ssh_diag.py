import paramiko

HOST = '82.198.228.182'
PORT = 65002
USER = 'u754458241'
PASS = 'Vixcell.eg2'

NODEJS_DIR = '/home/u754458241/domains/morsall.com/nodejs'

def run(client, cmd, timeout=120):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    return out, err

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=20)
print("CONNECTED\n")

# 1. Node version and memory
print("=== ENV ===")
out, err = run(client, 'free -m; echo ---; node --version 2>/dev/null || echo "no node"; echo ---; which node; ls /opt/alt/ 2>/dev/null | head -5')
print(out)

# 2. Check nodejs dir
print("\n=== nodejs dir ===")
out, err = run(client, f'ls -la {NODEJS_DIR} | head -25')
print(out)

# 3. Check Prisma client state
print("\n=== prisma client state ===")
out, err = run(client, f'ls {NODEJS_DIR}/node_modules/.prisma/client/ 2>&1 | head -20')
print(out)

# 4. Check if @prisma/client has Notification model
print("\n=== prisma client has Notification? ===")
out, err = run(client, f'grep -c "Notification" {NODEJS_DIR}/node_modules/.prisma/client/index.d.ts 2>&1 | head -5; echo ---; grep -c "customDesignRequest" {NODEJS_DIR}/node_modules/.prisma/client/index.d.ts 2>&1 | head -5')
print(out)

# 5. Schema check
print("\n=== schema.prisma exists? ===")
out, err = run(client, f'ls -la {NODEJS_DIR}/prisma/schema.prisma 2>&1; head -20 {NODEJS_DIR}/prisma/schema.prisma 2>&1')
print(out)

# 6. Check if Notification model is in current schema (extracted by zip)
print("\n=== Notification model in schema? ===")
out, err = run(client, f'grep -A 3 "model Notification" {NODEJS_DIR}/prisma/schema.prisma 2>&1 | head -10')
print(out)

client.close()
print("\nDONE")
