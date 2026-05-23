import paramiko

def switch_to_library_engine():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        # 1. Update server-hostinger.js
        server_js = '/home/u754458241/domains/morsall.com/nodejs/server-hostinger.js'
        print(f"Updating {server_js}...")
        client.exec_command(f"sed -i \"s|process.env.PRISMA_CLIENT_ENGINE_TYPE = 'binary';|process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';|\" {server_js}")
        
        # 2. Update all .env files
        env_files = [
            '/home/u754458241/domains/morsall.com/public_html/.env',
            '/home/u754458241/domains/morsall.com/public_html/app_new/.env',
            '/home/u754458241/nodeapp/.env',
            '/home/u754458241/domains/morsall.com/nodejs/.env'
        ]
        
        for f in env_files:
            dir_path = '/'.join(f.split('/')[:-1])
            print(f"Updating all .env files in {dir_path} to engine library...")
            client.exec_command(f"sed -i 's|PRISMA_CLIENT_ENGINE_TYPE=.*|PRISMA_CLIENT_ENGINE_TYPE=library|' {dir_path}/.env*")
            # If it doesn't exist, append it
            client.exec_command(f"grep -q 'PRISMA_CLIENT_ENGINE_TYPE' {dir_path}/.env || echo 'PRISMA_CLIENT_ENGINE_TYPE=library' >> {dir_path}/.env")

        # 3. Regenerate Prisma Client with library engine
        print("Generating Prisma Client (library)...")
        # We need to update schema.prisma as well if needed? No, engine type can be env var.
        client.exec_command("export PATH=$PATH:/opt/alt/alt-nodejs22/root/usr/bin && cd /home/u754458241/domains/morsall.com/nodejs/ && PRISMA_CLIENT_ENGINE_TYPE=library npx prisma generate")
        
        # 4. Restart
        print("Restarting services...")
        client.exec_command("touch /home/u754458241/domains/morsall.com/public_html/tmp/restart.txt")
        
        client.close()
        print("Done.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    switch_to_library_engine()
