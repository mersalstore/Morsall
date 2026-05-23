import paramiko

def check_stderr_file():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        log_file = '/home/u754458241/domains/morsall.com/nodejs/stderr.log'
        stdin, stdout, stderr = client.exec_command(f'tail -n 50 {log_file}')
        
        with open('scripts/latest_stderr.txt', 'w', encoding='utf-8') as f:
            f.write(stdout.read().decode('utf-8', errors='ignore'))
            
        client.close()
        print("Done. Check scripts/latest_stderr.txt")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_stderr_file()
