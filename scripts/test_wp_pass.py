import paramiko

def test_pGWOE_pass_on_Kanan():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        # Test password: EPTyNREvS6 for u754458241_Kanan
        cmd = "mysql -u u754458241_Kanan -pEPTyNREvS6 -e 'SHOW TABLES;' u754458241_Kanan"
        stdin, stdout, stderr = client.exec_command(cmd)
        
        out = stdout.read().decode()
        err = stderr.read().decode()
        
        if out:
            print("✅ SUCCESS with EPTyNREvS6!")
        else:
            print("❌ FAILED with EPTyNREvS6")
            print(err)
            
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_pGWOE_pass_on_Kanan()
