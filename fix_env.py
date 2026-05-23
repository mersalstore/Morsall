import paramiko

def fix_env():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        print(f"Connecting to {host}...")
        client.connect(host, port=port, username=user, password=pasw)
        
        env_path = '/home/u754458241/domains/morsall.com/nodejs/.env'
        
        # Replace 127.0.0.1 with localhost
        # Also ensure password is correct
        cmd = f"sed -i 's/127.0.0.1/localhost/g' {env_path} && sed -i 's/Code_2252/Mersal2026/g' {env_path}"
        client.exec_command(cmd)
        
        # Restart app
        client.exec_command('mkdir -p /home/u754458241/domains/morsall.com/nodejs/tmp && touch /home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt')
        
        print("Updated .env to localhost and restarted app.")
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_env()
