import paramiko
import os
import sys

# Connection details
hostname = '82.198.228.182'
port = 65002
username = 'u754458241'
password = 'Code_2252'

remote_path = '/home/u754458241/domains/morsall.com/nodejs/'

try:
    print(f"Connecting to {hostname}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname, port=port, username=username, password=password)
    print("Connected successfully!")

    # Try to find node and npm
    commands = [
        "ls -la /usr/local/bin/node /usr/local/bin/npm",
        "find /opt -name node -type f 2>/dev/null | head -n 5",
        "echo $PATH",
        "ls -la /home/u754458241/bin"
    ]

    for cmd in commands:
        print(f"\nExecuting: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd)
        print(stdout.read().decode())
        print(stderr.read().decode())

    client.close()

except Exception as e:
    print(f"An error occurred: {str(e)}")
    sys.exit(1)
