import paramiko

def read_remote_file(path):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        stdin, stdout, stderr = client.exec_command(f'cat {path}')
        content = stdout.read().decode('utf-8', errors='ignore')
        print(f"--- CONTENT OF {path} ---")
        print(content)
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        read_remote_file(sys.argv[1])
    else:
        print("Usage: python remote_read.py <path>")
