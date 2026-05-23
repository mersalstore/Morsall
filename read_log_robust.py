import paramiko

def read_log_ssh():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw, timeout=20)
        stdin, stdout, stderr = client.exec_command("tail -n 100 domains/morsall.com/nodejs/stderr.log")
        print(stdout.read().decode('utf-8', 'ignore'))
        client.close()
    except Exception as e:
        print(f"SSH Failed: {e}")

read_log_ssh()
