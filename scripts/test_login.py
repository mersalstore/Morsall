import paramiko

def test_login_only():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        # Test password: Code2252 for u754458241_Kanan
        cmd = "mysql -u u754458241_Kanan -pCode2252 -e 'SELECT 1;'"
        stdin, stdout, stderr = client.exec_command(cmd)
        
        out = stdout.read().decode()
        err = stderr.read().decode()
        
        if out:
            print("✅ LOGIN SUCCESS!")
        else:
            print("❌ LOGIN FAILED")
            print(err)
            
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login_only()
