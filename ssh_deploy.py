import paramiko
import time

hostname = '82.198.228.182'
port = 65002
username = 'u754458241'
password = '@n9qe3KgL'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print(f"Connecting to {hostname}...")
    client.connect(hostname, port=port, username=username, password=password, 
                   look_for_keys=False, allow_agent=False, timeout=20)
    print("Connected!")
    
    cmd = "cd /home/u754458241/domains/morsall.com/nodejs && unzip -o Morsall_Hostinger_Deploy.zip && mkdir -p tmp && touch tmp/restart.txt && echo DEPLOY_SUCCESS"
    print(f"Executing: {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd)
    
    output = stdout.read().decode('utf-8')
    error = stderr.read().decode('utf-8')
    
    print("Output:", output)
    print("Error:", error)
    
    client.close()
except Exception as e:
    import traceback
    traceback.print_exc()
    print("Failed:", str(e))
