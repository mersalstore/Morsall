import paramiko

def downgrade_prisma():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        # We'll do this in nodeapp and then re-link
        cmd = 'export PATH=$PATH:/opt/alt/alt-nodejs22/root/usr/bin && cd /home/u754458241/nodeapp/ && npm install @prisma/client@5.15.1 prisma@5.15.1 --no-save --no-package-lock'
        
        print("Downgrading Prisma to 5.15.1 (this may take a few minutes)...")
        stdin, stdout, stderr = client.exec_command(cmd)
        
        # Don't wait for completion if it's too slow, but let's try
        out = stdout.read().decode()
        err = stderr.read().decode()
        
        print("OUT:", out)
        print("ERR:", err)
        
        # If success, regenerate
        print("Regenerating Prisma 5 Client...")
        client.exec_command("export PATH=$PATH:/opt/alt/alt-nodejs22/root/usr/bin && cd /home/u754458241/nodeapp/ && npx prisma generate")
        
        # Restart
        client.exec_command("touch /home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt")
        
        client.close()
        print("Done.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    downgrade_prisma()
