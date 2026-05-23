import paramiko

ssh_host = '82.198.228.182'
ssh_port = 65002
ssh_user = 'u754458241'
ssh_pass = '@n9qe3KgL'

try:
    print("Connecting via SSH...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(ssh_host, port=ssh_port, username=ssh_user, password=ssh_pass, 
                   look_for_keys=False, allow_agent=False, timeout=20)
    print("Connected!")
    
    # Read the file
    sftp = client.open_sftp()
    remote_path = "/home/u754458241/domains/morsall.com/public_html/src/components/admin/LogisticsTab.tsx"
    print(f"Reading remote file: {remote_path}")
    with sftp.open(remote_path, "rb") as f:
        content_bytes = f.read()
    
    content = content_bytes.decode("utf-8", errors="ignore")
    print(f"File size: {len(content)} characters")
    
    # Save a copy locally to inspect
    with open("scratch/remote_LogisticsTab.tsx", "w", encoding="utf-8") as lf:
        lf.write(content)
    print("Saved remote file to scratch/remote_LogisticsTab.tsx")
    
    sftp.close()
    client.close()
except Exception as e:
    print(f"Error: {e}")
