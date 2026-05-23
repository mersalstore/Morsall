import paramiko

def search_mysql():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        cmd = 'grep -r "mysql://" /home/u754458241/domains/morsall.com --exclude-dir=node_modules --exclude-dir=.next'
        stdin, stdout, stderr = client.exec_command(cmd)
        
        with open('scripts/mysql_search_output.txt', 'w', encoding='utf-8') as f:
            f.write(stdout.read().decode('utf-8', errors='ignore'))
        
        print("Done. Check scripts/mysql_search_output.txt")
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    search_mysql()
