import paramiko
import time

def unzip_pty():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        print("Connected.")
        
        target_zip = "/home/u754458241/domains/morsall.com/public_html/comprehensive_deploy.zip"
        # Unzip to nodejs
        cmd = f"unzip -o {target_zip} -d /home/u754458241/domains/morsall.com/nodejs"
        print(f"Running: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd, get_pty=True)
        
        # Read output in real-time to keep connection alive
        while not stdout.channel.exit_status_ready():
            if stdout.channel.recv_ready():
                print(stdout.channel.recv(1024).decode('utf-8', 'ignore'), end='')
            time.sleep(0.1)
        
        print("\nFinished!")
        client.close()
    except Exception as e:
        print(f"\nFailed: {e}")

unzip_pty()
