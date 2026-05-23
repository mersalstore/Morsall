import paramiko

def finalize_fix():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        password = "Code2252"
        db_url = f"mysql://u754458241_Kanan:{password}@127.0.0.1/u754458241_Kanan"
        
        env_files = [
            '/home/u754458241/domains/morsall.com/public_html/.env',
            '/home/u754458241/domains/morsall.com/public_html/app_new/.env',
            '/home/u754458241/nodeapp/.env',
            '/home/u754458241/domains/morsall.com/nodejs/.env'
        ]
        
        for f in env_files:
            dir_path = '/'.join(f.split('/')[:-1])
            print(f"Updating all .env files in {dir_path}...")
            client.exec_command(f"sed -i 's|DATABASE_URL=.*|DATABASE_URL=\"{db_url}\"|' {dir_path}/.env*")
            client.exec_command(f"sed -i 's|NEXTAUTH_URL=.*|NEXTAUTH_URL=\"https://morsall.com\"|' {dir_path}/.env*")

        # Final check: generate prisma client in nodeapp and nodejs
        print("Generating Prisma Client...")
        client.exec_command("export PATH=$PATH:/opt/alt/alt-nodejs22/root/usr/bin && cd /home/u754458241/nodeapp/ && npx prisma generate")
        client.exec_command("export PATH=$PATH:/opt/alt/alt-nodejs22/root/usr/bin && cd /home/u754458241/domains/morsall.com/nodejs/ && npx prisma generate")
        
        # Restart all
        print("Restarting services...")
        client.exec_command("touch /home/u754458241/domains/morsall.com/public_html/tmp/restart.txt")
        client.exec_command("touch /home/u754458241/nodeapp/tmp/restart.txt")
        client.exec_command("touch /home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt")
        
        client.close()
        print("Done. Website should be up.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    finalize_fix()
