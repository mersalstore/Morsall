import paramiko

def try_prisma_pull_v2():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        print("Running npx prisma db pull...")
        cmd = 'cd /home/u754458241/nodeapp && /opt/alt/alt-nodejs22/root/usr/bin/npx prisma db pull'
        stdin, stdout, stderr = client.exec_command(cmd)
        print("OUT:", stdout.read().decode())
        print("ERR:", stderr.read().decode())
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    try_prisma_pull_v2()
