import paramiko

def find_alt_env():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        stdin, stdout, stderr = client.exec_command('find /home/u754458241/domains/morsall.net/ -name ".env*"')
        print(stdout.read().decode())
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    find_alt_env()
