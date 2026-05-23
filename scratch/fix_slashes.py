import paramiko
hostname = '82.198.228.182'
port = 65002
username = 'u754458241'
password = '@n9qe3KgL'
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password)

# Fix backslashes in required-server-files.json
cmd = "sed -i 's/\\\\\\\\/\\//g' /home/u754458241/nodeapp/.next/required-server-files.json"
client.exec_command(cmd)

# Restart
client.exec_command("touch /home/u754458241/nodeapp/tmp/restart.txt")
client.close()
print("Done!")
