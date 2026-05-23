import paramiko

def fix_env_production():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        print(f"Connecting to {host}...")
        client.connect(host, port=port, username=user, password=pasw)
        
        env_prod_path = '/home/u754458241/domains/morsall.com/nodejs/.env.production'
        
        # Replace Code_2252 with Mersal2026 and 127.0.0.1 with localhost
        cmd = f"sed -i 's/Code_2252/Mersal2026/g' {env_prod_path} && sed -i 's/127.0.0.1/localhost/g' {env_prod_path}"
        client.exec_command(cmd)
        
        # Also fix the .env file just in case
        env_path = '/home/u754458241/domains/morsall.com/nodejs/.env'
        cmd2 = f"sed -i 's/Code_2252/Mersal2026/g' {env_path} && sed -i 's/127.0.0.1/localhost/g' {env_path}"
        client.exec_command(cmd2)
        
        # Restart app
        client.exec_command('touch /home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt')
        
        print("Updated .env.production and .env to localhost/Mersal2026 and restarted app.")
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_env_production()
