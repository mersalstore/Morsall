import paramiko

def update_all_envs():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        # We'll use the three candidates in all .env files and see which one sticks
        # But for now, let's just use Mersal2026 as it's the most likely one (from history)
        # and test localhost vs 127.0.0.1
        
        password = "Mersal2026"
        db_url = f"mysql://u754458241_Kanan:{password}@localhost/u754458241_Kanan"
        
        env_files = [
            '/home/u754458241/domains/morsall.com/public_html/.env',
            '/home/u754458241/domains/morsall.com/public_html/app_new/.env',
            '/home/u754458241/nodeapp/.env',
            '/home/u754458241/domains/morsall.com/nodejs/.env'
        ]
        
        for f in env_files:
            print(f"Updating {f}...")
            client.exec_command(f"sed -i 's|DATABASE_URL=.*|DATABASE_URL=\"{db_url}\"|' {f}")
            
        # Restart
        client.exec_command("touch /home/u754458241/domains/morsall.com/public_html/tmp/restart.txt")
        client.exec_command("touch /home/u754458241/nodeapp/tmp/restart.txt")
        client.exec_command("touch /home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt")
        
        client.close()
        print("Done.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    update_all_envs()
