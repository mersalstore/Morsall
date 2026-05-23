import paramiko
import os

def upload_master_fix():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    local_path = r'c:\Users\hazem\Downloads\matger2\scripts\morsall_master_fix.php'
    remote_path = '/home/u754458241/domains/morsall.com/public_html/morsall_master_fix.php'
    
    try:
        print(f"Connecting to {host}...")
        client.connect(host, port=port, username=user, password=pasw, timeout=30)
        print("Connected. Uploading...")
        
        sftp = client.open_sftp()
        sftp.put(local_path, remote_path)
        sftp.close()
        
        print(f"Successfully uploaded to {remote_path}")
        client.close()
        return True
    except Exception as e:
        print(f"Failed to upload via SSH: {e}")
        return False

if __name__ == "__main__":
    upload_master_fix()
