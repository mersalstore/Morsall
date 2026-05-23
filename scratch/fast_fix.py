import paramiko
hostname = '82.198.228.182'
port = 65002
username = 'u754458241'
password = '@n9qe3KgL'
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect(hostname, port=port, username=username, password=password, timeout=10)
    client.exec_command("mv /home/u754458241/nodeapp/.next/server/app/page.js.bak /home/u754458241/nodeapp/.next/server/app/page.js")
    client.exec_command("touch /home/u754458241/nodeapp/tmp/restart.txt")
    client.close()
    print("SUCCESS")
except Exception as e:
    print("FAILED:", str(e))
