import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('82.198.228.182', port=65002, username='u754458241', password='Code_2252')

stdin, stdout, stderr = client.exec_command("ls -la /home/u754458241/domains/morsall.com/public_html/.builds/ 2>/dev/null")
print(stdout.read().decode())
client.close()
