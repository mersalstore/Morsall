import paramiko

def upload_admin_fix():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    local_path = r'c:\Users\hazem\Downloads\matger2\scripts\fix_admin_access.php'
    remote_path = '/home/u754458241/domains/morsall.com/public_html/fix_admin_access.php'
    
    try:
        client.connect(host, port=port, username=user, password=pasw, timeout=30)
        sftp = client.open_sftp()
        sftp.put(local_path, remote_path)
        sftp.close()
        client.close()
        print(f"Uploaded to {remote_path}")
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    upload_admin_fix()
