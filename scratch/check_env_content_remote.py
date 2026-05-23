import paramiko

def check_env_content_remote():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        # We'll create a script to read the first line of the .env files
        cmd = "head -n 1 /home/u754458241/nodeapp/.env.production"
        stdin, stdout, stderr = client.exec_command(cmd)
        print(f".env.production: {stdout.read().decode()}")
        
        cmd = "grep PRISMA_CLIENT_ENGINE_TYPE /home/u754458241/nodeapp/.env.production"
        stdin, stdout, stderr = client.exec_command(cmd)
        print(f"Engine Type: {stdout.read().decode()}")
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_env_content_remote()
