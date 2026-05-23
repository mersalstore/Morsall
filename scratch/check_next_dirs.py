import paramiko

def check_next():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        print("Listing _next:")
        stdin, stdout, stderr = client.exec_command("ls -R domains/morsall.com/nodejs/_next")
        print(stdout.read().decode())
        
        print("\nListing .next/static:")
        stdin, stdout, stderr = client.exec_command("ls -R domains/morsall.com/nodejs/.next/static")
        print(stdout.read().decode())
        
        client.close()
    except Exception as e:
        print(f"Failed: {e}")

check_next()
