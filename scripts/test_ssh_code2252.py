import paramiko

def test_ssh_user_code2252():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        # Test user: u754458241 with password: Code2252
        cmd = "mysql -u u754458241 -pCode2252 -e 'SHOW DATABASES;'"
        stdin, stdout, stderr = client.exec_command(cmd)
        
        out = stdout.read().decode()
        err = stderr.read().decode()
        
        print("OUT:", out)
        print("ERR:", err)
            
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_ssh_user_code2252()
