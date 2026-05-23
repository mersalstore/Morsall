import paramiko

def find_all_envs():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        cmd = 'find /home/u754458241 -name ".env" -o -name ".env.production" -o -name ".env.local"'
        stdin, stdout, stderr = client.exec_command(cmd)
        
        files = stdout.read().decode().splitlines()
        print(f"Found {len(files)} env files:")
        for f in files:
            print(f"--- {f} ---")
            # Read first line if it contains DATABASE_URL
            stdin2, stdout2, stderr2 = client.exec_command(f'grep "DATABASE_URL" {f}')
            print(stdout2.read().decode().strip())
            
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    find_all_envs()
