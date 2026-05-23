import paramiko

def check_latest_logs():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        for log_file in ['/home/u754458241/domains/morsall.com/nodejs/server.log', '/home/u754458241/domains/morsall.com/nodejs/stderr.log']:
            print(f"Reading {log_file}...")
            stdin, stdout, stderr = client.exec_command(f'tail -n 20 {log_file}')
            print(stdout.read().decode('utf-8', errors='ignore'))
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_latest_logs()
