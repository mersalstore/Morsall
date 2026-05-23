import paramiko

def limit_connections():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        # 1. Update DATABASE_URL with connection_limit=1
        new_url = "mysql://u754458241_Kanan:Code2252@127.0.0.1/u754458241_Kanan?connection_limit=1"
        
        env_files = [
            '/home/u754458241/domains/morsall.com/public_html/.env',
            '/home/u754458241/domains/morsall.com/public_html/app_new/.env',
            '/home/u754458241/nodeapp/.env',
            '/home/u754458241/domains/morsall.com/nodejs/.env'
        ]
        
        for f in env_files:
            dir_path = '/'.join(f.split('/')[:-1])
            print(f"Limiting connections in {dir_path}/.env*...")
            client.exec_command(f"sed -i 's|DATABASE_URL=.*|DATABASE_URL=\"{new_url}\"|' {dir_path}/.env*")
            
        # 2. Restart
        client.exec_command("touch /home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt")
        
        client.close()
        print("Done.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    limit_connections()
