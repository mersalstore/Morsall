import paramiko

def fix_all_envs_and_prisma():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    db_url = 'mysql://u754458241_Kanan:Code2252@127.0.0.1/u754458241_Kanan?connection_limit=1'
    
    env_files = [
        '/home/u754458241/domains/morsall.com/nodejs/.env',
        '/home/u754458241/domains/morsall.com/nodejs/.env.production',
        '/home/u754458241/nodeapp/.env',
        '/home/u754458241/nodeapp/.env.production'
    ]
    
    try:
        client.connect(host, port=port, username=user, password=pasw, timeout=30)
        
        for f_path in env_files:
            print(f"Updating {f_path}")
            # Update DATABASE_URL and PRISMA_CLIENT_ENGINE_TYPE
            cmd = f"sed -i 's|DATABASE_URL=.*|DATABASE_URL=\"{db_url}\"|g' {f_path}"
            client.exec_command(cmd)
            cmd = f"sed -i 's|PRISMA_CLIENT_ENGINE_TYPE=.*|PRISMA_CLIENT_ENGINE_TYPE=library|g' {f_path}"
            client.exec_command(cmd)
            
        # Run Prisma Generate with explicit output
        print("Running Prisma Generate...")
        node_bin = '/opt/alt/alt-nodejs22/root/usr/bin'
        node_path = f"{node_bin}:/usr/local/bin:/usr/bin:/bin"
        prj_dir = '/home/u754458241/domains/morsall.com/nodejs'
        
        # We'll generate it to BOTH locations to be safe
        out_paths = [
            f"{prj_dir}/node_modules/@prisma/client",
            "/home/u754458241/nodeapp/node_modules/@prisma/client"
        ]
        
        for out in out_paths:
            print(f"Generating to {out}...")
            gen_cmd = f"export PATH={node_path}:\$PATH && cd {prj_dir} && npx prisma generate --output {out}"
            stdin, stdout, stderr = client.exec_command(gen_cmd)
            print("STDOUT:", stdout.read().decode('utf-8', 'ignore'))
            print("STDERR:", stderr.read().decode('utf-8', 'ignore'))

        # Restart app
        print("Restarting app...")
        client.exec_command(f"mkdir -p {prj_dir}/tmp && touch {prj_dir}/tmp/restart.txt")
        client.exec_command("mkdir -p /home/u754458241/nodeapp/tmp && touch /home/u754458241/nodeapp/tmp/restart.txt")
        
        client.close()
        print("All done.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_all_envs_and_prisma()
