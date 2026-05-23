import paramiko

def check_mysql_cli():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        stdin, stdout, stderr = client.exec_command('mysql -u u754458241_Kanan -pMersal2026 -e "SHOW DATABASES;"')
        print("OUT:", stdout.read().decode())
        print("ERR:", stderr.read().decode())
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_mysql_cli()
