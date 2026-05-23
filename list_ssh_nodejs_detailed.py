import paramiko

def list_nodejs_detailed():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        path = "/home/u754458241/domains/morsall.com/nodejs"
        stdin, stdout, stderr = client.exec_command(f"ls -la {path}")
        print(f"Listing {path}:")
        print(stdout.read().decode())
        
        client.close()
    except Exception as e:
        print(f"Failed: {e}")

list_nodejs_detailed()
