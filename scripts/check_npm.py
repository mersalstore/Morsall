import paramiko

def check_npm_status():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        # Check npm.log
        print("--- LAST 5 LINES OF npm.log ---")
        stdin, stdout, stderr = client.exec_command('tail -n 5 /home/u754458241/nodeapp/npm.log')
        print(stdout.read().decode('utf-8', errors='ignore'))
        
        # Check processes
        print("--- NPM PROCESSES ---")
        stdin, stdout, stderr = client.exec_command('ps aux | grep npm | grep -v grep')
        print(stdout.read().decode('utf-8', errors='ignore'))
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_npm_status()
