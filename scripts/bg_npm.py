import paramiko

def background_npm():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        cmd = 'export PATH=$PATH:/opt/alt/alt-nodejs22/root/usr/bin && cd /home/u754458241/nodeapp/ && nohup npm install @prisma/client@5.15.1 prisma@5.15.1 --no-save --no-package-lock > npm.log 2>&1 &'
        client.exec_command(cmd)
        
        client.close()
        print("NPM install started in background. Check nodeapp/npm.log")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    background_npm()
