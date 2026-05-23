import paramiko

def list_allowed_dbs():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        cmd = "mysql -u u754458241_Kanan -pCode2252 -e 'SHOW DATABASES;'"
        stdin, stdout, stderr = client.exec_command(cmd)
        
        print("DATABASES:")
        print(stdout.read().decode())
            
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_allowed_dbs()
