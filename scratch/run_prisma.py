import paramiko
hostname = '82.198.228.182'
port = 65002
username = 'u754458241'
password = '@n9qe3KgL'
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password)

bin_dir = '/opt/alt/alt-nodejs20/root/usr/bin'
commands = [
    f"cd /home/u754458241/nodeapp && PATH={bin_dir}:$PATH npx prisma generate",
    f"cd /home/u754458241/nodeapp && PATH={bin_dir}:$PATH npx prisma db push --accept-data-loss"
]

for cmd in commands:
    print(f"Executing: {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd)
    print("STDOUT:", stdout.read().decode())
    print("STDERR:", stderr.read().decode())

client.close()
