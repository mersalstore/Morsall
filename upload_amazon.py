import paramiko
import os
from paramiko import SFTPClient

hostname = '82.198.228.182'
port = 65002
username = 'u754458241'
password = '@n9qe3KgL'

local_file = 'Morsall_Hostinger_Deploy_Amazon.zip'
remote_file = '/home/u754458241/domains/morsall.com/nodejs/Morsall_Hostinger_Deploy_Amazon.zip'

def progress(transferred, total):
    if transferred % (1024 * 1024 * 10) == 0 or transferred == total:
        print(f"Transferred: {transferred}/{total} ({100.0 * transferred / total:.1f}%)")

try:
    print(f"Connecting to {hostname}...")
    transport = paramiko.Transport((hostname, port))
    transport.connect(username=username, password=password)
    sftp = SFTPClient.from_transport(transport)
    
    print(f"Uploading {local_file} to {remote_file}...")
    sftp.put(local_file, remote_file, callback=progress)
    
    print("Upload completed successfully!")
    sftp.close()
    transport.close()
    
    # Now extract via SSH
    print("Extracting archive...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname, port=port, username=username, password=password)
    
    cmd = f"cd /home/u754458241/domains/morsall.com/nodejs/ && unzip -o Morsall_Hostinger_Deploy_Amazon.zip && rm Morsall_Hostinger_Deploy_Amazon.zip"
    stdin, stdout, stderr = client.exec_command(cmd)
    print(stdout.read().decode())
    
    print("Restarting server...")
    cmd = f"cd /home/u754458241/domains/morsall.com/nodejs/ && mkdir -p tmp && touch tmp/restart.txt"
    client.exec_command(cmd)
    
    print("Deployment FINISHED!")
    client.close()

except Exception as e:
    print(f"Error: {str(e)}")
    exit(1)
