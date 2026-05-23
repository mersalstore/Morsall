import paramiko

def get_node_env():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        # Find node process
        stdin, stdout, stderr = client.exec_command('ps aux | grep node | grep -v grep')
        print(stdout.read().decode())
        
        # If found, try to read environ of one of them
        # (Usually needs same user, which we are)
        # We can use /proc/self/environ too but that's for us.
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_node_env()
