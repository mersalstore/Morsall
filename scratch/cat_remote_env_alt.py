import paramiko

def cat_env_alt():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    file = '/home/u754458241/domains/morsall.com/public_html/app_new/.env.production'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        print(f"--- CONTENT OF {file} ---")
        stdin, stdout, stderr = client.exec_command(f'cat {file}')
        print(stdout.read().decode())
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    cat_env_alt()
