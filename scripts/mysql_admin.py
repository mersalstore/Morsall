import paramiko

def mysql_admin_update():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        email = 'blackhatsd.sd@gmail.com'
        # Hashed password for 'Code2252' (Standard PHP password_hash)
        # Using a known hash for 'Code2252'
        hashed_pass = '$2y$10$C8.u2uX1Qk9m2e5Z6pX2u.Kk5qO6j8oU6O0XzG8U7E5e9D6v.I1G.' # This is just an example hash
        
        # Actually, I'll just use a SQL UPDATE
        sql = f"UPDATE User SET role = 'ADMIN' WHERE email = '{email}';"
        cmd = f"mysql -u u754458241_Kanan -pCode2252 -e \\\"{sql}\\\" u754458241_Kanan"
        
        stdin, stdout, stderr = client.exec_command(cmd)
        print("OUT:", stdout.read().decode())
        print("ERR:", stderr.read().decode())
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    mysql_admin_update()
