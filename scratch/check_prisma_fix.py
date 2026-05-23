import paramiko

def check_recent_errors():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        # Look for Prisma errors in the last 100 lines
        stdin, stdout, stderr = client.exec_command("tail -n 100 domains/morsall.com/nodejs/stderr.log")
        content = stdout.read().decode('utf-8', errors='replace')
        
        if "invalid port number" in content:
            print("FOUND: 'invalid port number' error is still present!")
        else:
            print("GOOD: 'invalid port number' error not found in last 100 lines.")
            
        print("\nLast 20 lines of stderr.log:")
        print("\n".join(content.splitlines()[-20:]))
        
        client.close()
    except Exception as e:
        print(f"Failed: {e}")

check_recent_errors()
