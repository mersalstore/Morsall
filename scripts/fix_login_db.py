import paramiko

def fix_login_and_db():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw, timeout=30)
        print("Connected.")
        
        # 1. Kill node
        print("Killing node processes...")
        client.exec_command('pkill -u u754458241 node')
        
        # 2. Push schema
        print("Pushing Prisma schema...")
        cmd = 'export PATH=$PATH:/opt/alt/alt-nodejs22/root/usr/bin && cd /home/u754458241/nodeapp/ && npx prisma db push --accept-data-loss'
        stdin, stdout, stderr = client.exec_command(cmd)
        
        out = stdout.read().decode()
        err = stderr.read().decode()
        print("OUT:", out)
        print("ERR:", err)
        
        # 3. Restart
        print("Restarting app...")
        client.exec_command('touch /home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt')
        
        client.close()
        print("Done.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_login_and_db()
