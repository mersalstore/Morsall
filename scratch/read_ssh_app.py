import paramiko

def read_file(path):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        stdin, stdout, stderr = client.exec_command(f"cat {path}")
        print(f"Content of {path}:")
        print(stdout.read().decode())
        
        client.close()
    except Exception as e:
        print(f"Failed: {e}")

read_file("domains/morsall.com/nodejs/app.js")
