import paramiko

def search_user_strings():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        # Search for u754458241_ in all files in domains
        cmd = 'grep -r "u754458241_" /home/u754458241/domains/ --exclude-dir=node_modules'
        print(f"Running: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd)
        print(stdout.read().decode())
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    search_user_strings()
