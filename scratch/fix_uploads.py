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
    
    print("Checking uploads directory...")
    stdin, stdout, stderr = client.exec_command(f'mkdir -p {app_root}public/uploads && chmod -R 777 {app_root}public/uploads')
    print("Output:")
    print(stdout.read().decode('utf-8'))
    print(stderr.read().decode('utf-8'))
    
    stdin, stdout, stderr = client.exec_command(f'ls -la {app_root}public/')
    print("Public dir content:")
    print(stdout.read().decode('utf-8'))

finally:
    client.close()
