import paramiko

def find_db():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        print(f"Connecting to {host}...")
        client.connect(host, port=port, username=user, password=pasw)
        
        # Search for database strings in all files
        command = 'grep -rh "mysql://" /home/u754458241 --exclude-dir=node_modules --exclude-dir=.next'
        stdin, stdout, stderr = client.exec_command(command)
        
        print("FOUND STRINGS:")
        print(stdout.read().decode())
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    find_db()
