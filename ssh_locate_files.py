import paramiko

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
    
    # 1. Let's list current directory path in SSH
    stdin, stdout, stderr = client.exec_command("pwd")
    print("Current pwd:", stdout.read().decode('utf-8').strip())
    
    # 2. Let's search for comprehensive_deploy.zip in the jail
    cmd_find = "find . -name 'comprehensive_deploy.zip' -o -name 'sync_to_nodejs.php'"
    print(f"Executing: {cmd_find}")
    stdin, stdout, stderr = client.exec_command(cmd_find)
    print("Find results:\n", stdout.read().decode('utf-8'))
    
    # 3. Let's list public_html folder contents
    stdin, stdout, stderr = client.exec_command("ls -la public_html/")
    print("Contents of public_html/:\n", stdout.read().decode('utf-8'))
    
    client.close()
except Exception as e:
    import traceback
    traceback.print_exc()
