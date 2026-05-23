import paramiko

def check_nodejs_log():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        path = "/home/u754458241/domains/morsall.com/nodejs/stderr.log"
        stdin, stdout, stderr = client.exec_command(f"tail -n 100 {path}")
        print(f"Last 100 lines of {path}:")
        data = stdout.read()
        print(data.decode('utf-8', 'ignore'))
        
        client.close()
    except Exception as e:
        print(f"Failed: {e}")

check_nodejs_log()
