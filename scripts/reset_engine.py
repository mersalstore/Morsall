import paramiko

def reset_engine_defaults():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        # 1. Remove from server-hostinger.js
        server_js = '/home/u754458241/domains/morsall.com/nodejs/server-hostinger.js'
        client.exec_command(f"sed -i \"/process.env.PRISMA_CLIENT_ENGINE_TYPE =/d\" {server_js}")
        
        # 2. Remove from .env files
        env_files = [
            '/home/u754458241/domains/morsall.com/public_html/.env',
            '/home/u754458241/domains/morsall.com/public_html/app_new/.env',
            '/home/u754458241/nodeapp/.env',
            '/home/u754458241/domains/morsall.com/nodejs/.env'
        ]
        
        for f in env_files:
            dir_path = '/'.join(f.split('/')[:-1])
            client.exec_command(f"sed -i \"/PRISMA_CLIENT_ENGINE_TYPE/d\" {dir_path}/.env*")

        # 3. Regenerate Prisma Client (default)
        print("Generating Prisma Client (default)...")
        client.exec_command("export PATH=$PATH:/opt/alt/alt-nodejs22/root/usr/bin && cd /home/u754458241/domains/morsall.com/nodejs/ && npx prisma generate")
        
        # 4. Restart
        client.exec_command("touch /home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt")
        
        client.close()
        print("Done.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    reset_engine_defaults()
