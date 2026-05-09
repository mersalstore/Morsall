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
    node_bin = '/opt/alt/alt-nodejs22/root/usr/bin/node'
    
    # Upload test-db.js
    sftp = client.open_sftp()
    sftp.put('c:/Users/hazem/Downloads/matger2/scratch/test-db.js', f'{app_root}test-db.js')
    sftp.close()
    
    print("Running database test script on server...")
    cmd = f'export PATH=/opt/alt/alt-nodejs22/root/usr/bin/:$PATH && cd {app_root} && {node_bin} test-db.js'
    stdin, stdout, stderr = client.exec_command(cmd)
    print(stdout.read().decode('utf-8'))
    print(stderr.read().decode('utf-8'))

finally:
    client.close()
