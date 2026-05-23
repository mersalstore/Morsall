import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('82.198.228.182', port=65002, username='u754458241', password='@n9qe3KgL')

commands = [
    "cat /home/u754458241/domains/morsall.com/public_html/.env",
    "ls -R /home/u754458241/domains/morsall.com/public_html/"
]

for cmd in commands:
    print(f"--- Executing: {cmd} ---")
    stdin, stdout, stderr = client.exec_command(cmd)
    print(stdout.read().decode())
    err = stderr.read().decode()
    if err:
        print(f"Error: {err}")

client.close()
