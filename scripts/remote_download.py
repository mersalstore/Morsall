import paramiko

def read_remote_file(path, local_path):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        sftp = client.open_sftp()
        sftp.get(path, local_path)
        sftp.close()
        client.close()
        print(f"File {path} downloaded to {local_path}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 2:
        read_remote_file(sys.argv[1], sys.argv[2])
    else:
        print("Usage: python remote_read.py <remote_path> <local_path>")
