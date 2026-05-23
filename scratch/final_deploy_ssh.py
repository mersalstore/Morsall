import paramiko
import sys
import io

# Force UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    print("Attempting SSH with long timeout...")
    client.connect('82.198.228.182', port=65002, username='u754458241', password='Code_2252', timeout=30, banner_timeout=30)
    
    app_root = '/home/u754458241/domains/morsall.com/nodejs/'
    node_bin = '/opt/alt/alt-nodejs22/root/usr/bin/'
    
    print("Executing git pull and prisma generate...")
    cmd = f'export PATH={node_bin}:$PATH && cd {app_root} && git pull && npx prisma generate && touch tmp/restart.txt'
    stdin, stdout, stderr = client.exec_command(cmd)
    print("STDOUT:", stdout.read().decode('utf-8'))
    print("STDERR:", stderr.read().decode('utf-8'))

except Exception as e:
    print(f"Error: {e}")
finally:
    client.close()
