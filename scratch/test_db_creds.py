import paramiko

def test_db_creds():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    passwords = ['Code2252', '4aE1b?DI|']
    db_name = 'u754458241_Kanan'
    db_user = 'u754458241_Kanan'
    
    try:
        client.connect(host, port=port, username=user, password=pasw, timeout=30)
        
        for p in passwords:
            print(f"Testing password: {p}")
            cmd = f"mysql -u {db_user} -p'{p}' -e 'select 1' {db_name}"
            stdin, stdout, stderr = client.exec_command(cmd)
            out = stdout.read().decode().strip()
            err = stderr.read().decode().strip()
            if "1" in out:
                print(f"SUCCESS with password: {p}")
            else:
                print(f"FAILED with password: {p}")
                print(f"Error: {err}")
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_db_creds()
