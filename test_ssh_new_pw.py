import paramiko

def test_ssh():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        print(f"Connecting to {host}...")
        client.connect(host, port=port, username=user, password=pasw)
        print("SSH Connection Successful!")
        
        stdin, stdout, stderr = client.exec_command("pwd && ls -la")
        print("PWD:", stdout.read().decode())
        
        client.close()
    except Exception as e:
        print(f"SSH Connection Failed: {e}")

test_ssh()
