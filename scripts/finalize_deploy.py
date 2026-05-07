import paramiko
import os
import sys

# Connection details
hostname = '82.198.228.182'
port = 65002
username = 'u754458241'
password = 'Code_2252'

remote_path = '/home/u754458241/domains/morsall.com/nodejs/'
node_path = "/opt/alt/alt-nodejs22/root/usr/bin/node"
npx_path = "/opt/alt/alt-nodejs22/root/usr/bin/npx"

try:
    print(f"Connecting to {hostname}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname, port=port, username=username, password=password)
    print("Connected successfully!")

    commands = [
        f"cd {remote_path} && {node_path} {npx_path} prisma generate",
        f"cd {remote_path} && touch tmp/restart.txt"
    ]

    for cmd in commands:
        print(f"Executing: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd)
        print(stdout.read().decode())
        err = stderr.read().decode()
        if err:
            print(f"Error output: {err}")

    print("Final setup steps completed!")
    client.close()

except Exception as e:
    print(f"An error occurred: {str(e)}")
    sys.exit(1)
