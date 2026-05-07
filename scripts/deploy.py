import paramiko
import os
import sys

# Connection details
hostname = '82.198.228.182'
port = 65002
username = 'u754458241'
password = 'Code_2252'

local_zip = os.path.join(os.getcwd(), 'Morsall_Deploy_Final.zip')
remote_path = '/home/u754458241/domains/morsall.com/nodejs/'
remote_zip = remote_path + 'Morsall_Deploy_Final.zip'

def progress(transferred, total):
    percent = (transferred / total) * 100
    sys.stdout.write(f"\rUploading: {percent:.2f}%")
    sys.stdout.flush()

try:
    print(f"Connecting to {hostname}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname, port=port, username=username, password=password)
    print("Connected successfully!")

    print("Starting SFTP for upload...")
    sftp = client.open_sftp()
    print(f"Uploading {local_zip} to {remote_zip}...")
    sftp.put(local_zip, remote_zip, callback=progress)
    print("\nUpload completed!")
    sftp.close()

    print("Extracting zip file...")
    # Use Node.js 22 as it's modern and likely what's needed
    node_path = "/opt/alt/alt-nodejs22/root/usr/bin/node"
    npm_path = "/opt/alt/alt-nodejs22/root/usr/bin/npm"
    
    commands = [
        f"cd {remote_path} && unzip -o Morsall_Deploy_Final.zip",
        f"cd {remote_path} && rm Morsall_Deploy_Final.zip",
        f"cd {remote_path} && {node_path} {npm_path} install",
        f"cd {remote_path} && {node_path} node_modules/prisma/build/index.js generate"
    ]

    for cmd in commands:
        print(f"Executing: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd)
        
        # Read output in real-time
        for line in iter(stdout.readline, ""):
            print(line, end="")
        
        err = stderr.read().decode()
        if err:
            print(f"Error output: {err}")

    print("Deployment finished successfully!")
    client.close()

except Exception as e:
    print(f"An error occurred: {str(e)}")
    sys.exit(1)
