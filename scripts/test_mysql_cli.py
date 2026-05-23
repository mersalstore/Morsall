import paramiko

def test_mysql_cli():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        # We use a file to store the password and use it with mysql
        # This avoids shell escaping issues
        password = r"l$9Qs3i]g0y]/V~k"
        client.exec_command(f"echo '{password}' > ~/db_pass.txt")
        
        cmd = "mysql -u u754458241_Kanan -p$(cat ~/db_pass.txt) -e 'SHOW TABLES;' u754458241_Kanan"
        stdin, stdout, stderr = client.exec_command(cmd)
        
        out = stdout.read().decode()
        err = stderr.read().decode()
        
        print("OUT:", out)
        print("ERR:", err)
        
        client.exec_command("rm ~/db_pass.txt")
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_mysql_cli()
