import paramiko

def search_db_conn_code():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        # Search for connection code in php files
        cmd = 'grep -r "new mysqli" /home/u754458241/domains/ --include="*.php"'
        print(f"Running: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd)
        print(stdout.read().decode())
        
        cmd2 = 'grep -r "new PDO" /home/u754458241/domains/ --include="*.php"'
        print(f"Running: {cmd2}")
        stdin, stdout, stderr = client.exec_command(cmd2)
        print(stdout.read().decode())
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    search_db_conn_code()
