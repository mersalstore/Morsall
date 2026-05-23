import paramiko
import os

host = '82.198.228.182'
port = 65002
user = 'u754458241'
pasw = '@n9qe3KgL'
remote_path = '/home/u754458241/nodeapp/deploy.zip'
local_path = 'c:/Users/hazem/Downloads/matger2/deploy.zip'

def upload():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print(f"Connecting to {host}...")
        client.connect(host, port=port, username=user, password=pasw, timeout=30)
        sftp = client.open_sftp()
        print(f"Uploading {local_path} to {remote_path}...")
        sftp.put(local_path, remote_path)
        sftp.close()
        client.close()
        print("Upload successful!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    upload()
