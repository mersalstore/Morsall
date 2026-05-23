import paramiko

def check_admin_user():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    db_pass = 'Code2252'
    db_name = 'u754458241_Kanan'
    db_user = 'u754458241_Kanan'
    
    try:
        client.connect(host, port=port, username=user, password=pasw, timeout=30)
        
        email = 'blackhatsd.sd@gmail.com'
        cmd = f"mysql -u {db_user} -p'{db_pass}' -e \"SELECT id, email, role FROM User WHERE email='{email}'\" {db_name}"
        stdin, stdout, stderr = client.exec_command(cmd)
        out = stdout.read().decode().strip()
        print(f"User check for {email}:\n{out}")
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_admin_user()
