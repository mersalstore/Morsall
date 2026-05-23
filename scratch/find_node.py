import paramiko

def find_node():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        cmds = ["which node", "whereis node", "alias", "echo $PATH"]
        for cmd in cmds:
            stdin, stdout, stderr = client.exec_command(cmd)
            print(f"Result of {cmd}:")
            print(stdout.read().decode())
        
        client.close()
    except Exception as e:
        print(f"Failed: {e}")

find_node()
