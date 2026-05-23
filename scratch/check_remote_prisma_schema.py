import paramiko

def check_remote_prisma_schema():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        cmd = 'grep "datasource db" -A 5 /home/u754458241/nodeapp/prisma/schema.prisma'
        print(f"Running: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd)
        print(stdout.read().decode())
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_remote_prisma_schema()
