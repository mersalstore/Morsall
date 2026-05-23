import paramiko

def try_mysql_cli():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    creds = [
        ('u754458241_Kanan', 'Mersal2026'),
        ('u754458241_Kanan', 'Code_2252'),
        ('u754458241', 'Mersal2026'),
        ('u754458241', 'Code_2252')
    ]
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        for u, p in creds:
            print(f"Trying {u} with {p}...")
            stdin, stdout, stderr = client.exec_command(f'mysql -u {u} -p{p} -e "SHOW DATABASES;"')
            out = stdout.read().decode()
            err = stderr.read().decode()
            if out:
                print(f"SUCCESS for {u}: {out}")
                break
            else:
                print(f"FAILED for {u}: {err}")
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    try_mysql_cli()
