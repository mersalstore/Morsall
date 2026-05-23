import paramiko

def find_schema():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        cmd = 'find /home/u754458241 -name "schema.prisma"'
        stdin, stdout, stderr = client.exec_command(cmd)
        
        print(stdout.read().decode('utf-8', errors='ignore'))
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    find_schema()
