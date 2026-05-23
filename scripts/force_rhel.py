import paramiko

def force_rhel_engine():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        # 1. Find the RHEL engine path
        engine_path = '/home/u754458241/nodeapp/node_modules/.prisma/client/libquery_engine-rhel-openssl-1.1.x.so.node'
        
        # 2. Update .env files to force this engine
        env_files = [
            '/home/u754458241/domains/morsall.com/public_html/.env',
            '/home/u754458241/domains/morsall.com/public_html/app_new/.env',
            '/home/u754458241/nodeapp/.env',
            '/home/u754458241/domains/morsall.com/nodejs/.env'
        ]
        
        for f in env_files:
            dir_path = '/'.join(f.split('/')[:-1])
            print(f"Forcing RHEL engine in {dir_path}/.env*...")
            client.exec_command(f"sed -i '/PRISMA_QUERY_ENGINE_LIBRARY/d' {dir_path}/.env*")
            client.exec_command(f"echo 'PRISMA_QUERY_ENGINE_LIBRARY=\"{engine_path}\"' >> {dir_path}/.env")
            client.exec_command(f"echo 'PRISMA_QUERY_ENGINE_LIBRARY=\"{engine_path}\"' >> {dir_path}/.env.production")
            
        # 3. Update server-hostinger.js to include it in process.env
        server_js = '/home/u754458241/domains/morsall.com/nodejs/server-hostinger.js'
        client.exec_command(f"sed -i \"/process.env.PRISMA_QUERY_ENGINE_LIBRARY =/d\" {server_js}")
        # Insert after line 18
        client.exec_command(f"sed -i \"18a process.env.PRISMA_QUERY_ENGINE_LIBRARY = '{engine_path}';\" {server_js}")
        
        # 4. Restart
        client.exec_command("touch /home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt")
        
        client.close()
        print("Done.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    force_rhel_engine()
