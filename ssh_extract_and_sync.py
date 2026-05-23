import paramiko
import time

hostname = '82.198.228.182'
port = 65002
username = 'u754458241'
password = '@n9qe3KgL'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print(f"Connecting to {hostname}:{port}...")
    client.connect(hostname, port=port, username=username, password=password, 
                   look_for_keys=False, allow_agent=False, timeout=20)
    print("Connected successfully via SSH!")
    
    # 1. Navigate to domains/morsall.com/public_html, unzip comprehensive_deploy.zip, and run php sync_to_nodejs.php
    cmd = (
        "cd /home/u754458241/domains/morsall.com/public_html && "
        "unzip -o comprehensive_deploy.zip && "
        "php sync_to_nodejs.php"
    )
    print(f"Executing remote deployment command:\n{cmd}")
    stdin, stdout, stderr = client.exec_command(cmd)
    
    # Wait for execution and print outputs
    output = stdout.read().decode('utf-8')
    error = stderr.read().decode('utf-8')
    
    print("\n--- STDOUT ---")
    print(output)
    
    print("\n--- STDERR ---")
    print(error)
    
    # Cleanup zip file from public_html
    cleanup_cmd = "rm -f /home/u754458241/domains/morsall.com/public_html/comprehensive_deploy.zip"
    client.exec_command(cleanup_cmd)
    print("\nCleaned up comprehensive_deploy.zip from public_html.")
    
    client.close()
    print("SSH session closed.")
except Exception as e:
    import traceback
    traceback.print_exc()
    print("SSH execution failed:", str(e))
