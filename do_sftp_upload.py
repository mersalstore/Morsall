import paramiko
import sys

try:
    print("Connecting via SSH...")
    transport = paramiko.Transport(('82.198.228.182', 65002))
    transport.connect(username='u754458241', password='@n9qe3KgL')
    
    print("Opening SFTP session...")
    sftp = paramiko.SFTPClient.from_transport(transport)
    
    remote_path = '/home/u754458241/domains/morsall.com/nodejs/fixes2.zip'
    local_path = 'fixes2.zip'
    
    print(f"Uploading {local_path} to {remote_path}...")
    sftp.put(local_path, remote_path)
    print("Upload complete!")
    
    sftp.close()
    transport.close()
except Exception as e:
    print(f"Error: {e}")
