import paramiko

def cat_env_files():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    files = [
        '/home/u754458241/domains/morsall.com/nodejs/.env.production',
        '/home/u754458241/domains/morsall.com/nodejs/.env'
    ]
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        for f in files:
            print(f"--- CONTENT OF {f} ---")
            stdin, stdout, stderr = client.exec_command(f'cat {f}')
            print(stdout.read().decode())
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    cat_env_files()
