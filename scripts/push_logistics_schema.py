import paramiko

def push_schema():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        # 1. Upload local schema to server
        sftp = client.open_sftp()
        sftp.put('c:/Users/hazem/Downloads/matger2/prisma/schema.prisma', '/home/u754458241/nodeapp/prisma/schema.prisma')
        sftp.close()
        
        # 2. Push schema
        print("Pushing Prisma schema to server database...")
        cmd = 'export PATH=$PATH:/opt/alt/alt-nodejs22/root/usr/bin && cd /home/u754458241/nodeapp/ && PRISMA_CLIENT_ENGINE_TYPE=library npx prisma db push --accept-data-loss'
        stdin, stdout, stderr = client.exec_command(cmd)
        
        print("OUT:", stdout.read().decode())
        print("ERR:", stderr.read().decode())
        
        # 3. Regenerate
        print("Regenerating client...")
        client.exec_command('export PATH=$PATH:/opt/alt/alt-nodejs22/root/usr/bin && cd /home/u754458241/nodeapp/ && PRISMA_CLIENT_ENGINE_TYPE=library npx prisma generate')
        
        # 4. Restart
        client.exec_command("touch /home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt")
        
        client.close()
        print("Done.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    push_schema()
