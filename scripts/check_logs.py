import paramiko

def find_server_logs():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        cmd = 'find /home/u754458241 -name "server.log"'
        stdin, stdout, stderr = client.exec_command(cmd)
        
        files = stdout.read().decode().splitlines()
        for f in files:
            print(f"--- {f} ---")
            stdin2, stdout2, stderr2 = client.exec_command(f'tail -n 10 {f}')
            print(stdout2.read().decode('utf-8', errors='ignore').strip())
            
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    find_server_logs()
