import paramiko
import sys
import io

# Force UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect('82.198.228.182', port=65002, username='u754458241', password='Code_2252')
    
    app_root = '/home/u754458241/domains/morsall.com/nodejs/'
    
    # Try to run a prisma command to check users
    # We need to find where npx is or use the full path
    npx_path = '/opt/alt/alt-nodejs22/root/usr/bin/npx'
    
    print("Checking database users...")
    stdin, stdout, stderr = client.exec_command(f'cd {app_root} && {npx_path} prisma db push')
    print("Prisma DB Push output:")
    print(stdout.read().decode('utf-8'))
    print(stderr.read().decode('utf-8'))

finally:
    client.close()
