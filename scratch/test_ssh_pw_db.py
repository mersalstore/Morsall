import paramiko

def try_ssh_pw_for_db():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        print(f"Trying SSH password for DB...")
        stdin, stdout, stderr = client.exec_command(f'mysql -u u754458241_Kanan -p{pasw} -e "SHOW DATABASES;"')
        out = stdout.read().decode()
        err = stderr.read().decode()
        if out:
            print(f"SUCCESS: {out}")
        else:
            print(f"FAILED: {err}")
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    try_ssh_pw_for_db()
