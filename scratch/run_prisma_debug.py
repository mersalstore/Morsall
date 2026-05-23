import paramiko
import os

def run_debug():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        sftp = client.open_sftp()
        print("Uploading debug script...")
        sftp.put("scratch/debug_prisma_remote.js", "domains/morsall.com/nodejs/debug_prisma_remote.js")
        sftp.close()
        
        print("Running debug script...")
        # Use node directly
        cmd = "cd domains/morsall.com/nodejs && node debug_prisma_remote.js"
        stdin, stdout, stderr = client.exec_command(cmd)
        
        print("STDOUT:")
        print(stdout.read().decode())
        print("STDERR:")
        print(stderr.read().decode())
        
        client.close()
    except Exception as e:
        print(f"Failed: {e}")

run_debug()
