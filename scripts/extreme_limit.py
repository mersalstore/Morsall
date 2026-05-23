import paramiko

def extreme_limit():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        # 1. Update DATABASE_URL with extreme limits
        new_url = "mysql://u754458241_Kanan:Code2252@127.0.0.1/u754458241_Kanan?connection_limit=1&socket_timeout=10&statement_cache_size=0"
        
        dirs = [
            '/home/u754458241/domains/morsall.com/public_html',
            '/home/u754458241/domains/morsall.com/public_html/app_new',
            '/home/u754458241/nodeapp',
            '/home/u754458241/domains/morsall.com/nodejs'
        ]
        
        for d in dirs:
            for f in ['.env', '.env.production']:
                path = f"{d}/{f}"
                client.exec_command(f"sed -i 's|DATABASE_URL=.*|DATABASE_URL=\"{new_url}\"|' {path}")
                
        # 2. Force BINARY engine type this time (maybe it works better with overwrite)
        for d in dirs:
            for f in ['.env', '.env.production']:
                path = f"{d}/{f}"
                client.exec_command(f"sed -i 's|PRISMA_CLIENT_ENGINE_TYPE=.*|PRISMA_CLIENT_ENGINE_TYPE=binary|' {path}")

        # 3. Restart
        client.exec_command("touch /home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt")
        
        client.close()
        print("Done.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    extreme_limit()
