import paramiko

def test_db_port():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        print("Testing port 3306 on localhost...")
        stdin, stdout, stderr = client.exec_command('nc -zv localhost 3306')
        print(stdout.read().decode())
        print(stderr.read().decode())
        
        print("Testing port 3306 on 127.0.0.1...")
        stdin, stdout, stderr = client.exec_command('nc -zv 127.0.0.1 3306')
        print(stdout.read().decode())
        print(stderr.read().decode())
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_db_port()
