import paramiko

def check_ssh_log():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        path = "domains/morsall.com/public_html/app_new/stderr.log"
        stdin, stdout, stderr = client.exec_command(f"tail -n 50 {path}")
        print(f"Last 50 lines of {path}:")
        print(stdout.read().decode())
        
        client.close()
    except Exception as e:
        print(f"Failed: {e}")

check_ssh_log()
