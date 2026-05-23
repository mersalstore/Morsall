import paramiko

def find_db_name():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        # Try to list databases without password (sometimes works for own user)
        stdin, stdout, stderr = client.exec_command('mysql -u u754458241 -e "SHOW DATABASES;"')
        print("mysql -u u754458241:")
        print(stdout.read().decode())
        print(stderr.read().decode())
        
        # Try to see if there are any .sql files that might have hints
        stdin, stdout, stderr = client.exec_command('find /home/u754458241/ -name "*.sql" -ls')
        print("SQL files:")
        print(stdout.read().decode())
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    find_db_name()
