import paramiko

def check_logs():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        path = "domains/morsall.com/nodejs/stderr.log"
        stdin, stdout, stderr = client.exec_command(f"tail -n 50 {path}")
        print("Last 50 lines of stderr.log:")
        print(stdout.read().decode('utf-8', errors='replace'))
        
        path2 = "domains/morsall.com/nodejs/server.log"
        stdin, stdout, stderr = client.exec_command(f"tail -n 50 {path2}")
        print("\nLast 50 lines of server.log:")
        print(stdout.read().decode('utf-8', errors='replace'))
        
        client.close()
    except Exception as e:
        print(f"Failed: {e}")

check_logs()
