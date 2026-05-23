import paramiko

def test_ssh_user_on_db():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        # Test password: @n9qe3KgL for u754458241
        cmd = f"mysql -u {user} -p'{pasw}' -e 'SHOW TABLES;' u754458241_Kanan"
        stdin, stdout, stderr = client.exec_command(cmd)
        
        out = stdout.read().decode()
        err = stderr.read().decode()
        
        if out:
            print(f"✅ SUCCESS with {user}!")
        else:
            print(f"❌ FAILED with {user}")
            print(err)
            
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_ssh_user_on_db()
