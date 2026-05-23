import paramiko

def search_remote_creds():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        # Search for passwords in config files
        cmd = 'grep -r "u754458241_Kanan" /home/u754458241/domains/morsall.com/ --exclude-dir=node_modules --exclude-dir=.next'
        print(f"Running: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd)
        print(stdout.read().decode())
        
        # Also check /home/u754458241/nodeapp/
        cmd2 = 'grep -r "u754458241_Kanan" /home/u754458241/nodeapp/ --exclude-dir=node_modules --exclude-dir=.next'
        print(f"Running: {cmd2}")
        stdin, stdout, stderr = client.exec_command(cmd2)
        print(stdout.read().decode())
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    search_remote_creds()
