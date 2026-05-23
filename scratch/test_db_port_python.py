import paramiko

def test_db_port_python():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        cmd = 'python3 -c "import socket; s = socket.socket(); print(s.connect_ex((\'127.0.0.1\', 3306)))"'
        print(f"Running: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd)
        print("Result (0 means open):", stdout.read().decode())
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_db_port_python()
