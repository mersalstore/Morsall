import paramiko

def unzip_nodejs():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        print("Connected.")
        
        path = "domains/morsall.com/nodejs"
        cmd = f"cd {path} && unzip -o deploy_nodejs.zip && touch tmp/restart.txt && rm deploy_nodejs.zip"
        print(f"Running: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd)
        print("OUT:", stdout.read().decode())
        print("ERR:", stderr.read().decode())
        
        client.close()
    except Exception as e:
        print(f"Failed: {e}")

unzip_nodejs()
