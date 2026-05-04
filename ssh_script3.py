import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('82.198.228.182', port=65002, username='u754458241', password='Code_2252')

commands = [
    "ls -lad /home/u754458241/domains/morsall.com/public_html/.builds/source/src/app/admin 2>/dev/null",
    "ls -la /home/u754458241/domains/morsall.com/public_html/.builds/source/src/app/admin/dashboard 2>/dev/null",
    "chmod -R a+rX /home/u754458241/domains/morsall.com/public_html/.builds/source 2>/dev/null"
]

for cmd in commands:
    print(f"Executing: {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd)
    print(stdout.read().decode())
    print(stderr.read().decode())

client.close()
