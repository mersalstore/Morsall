import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('82.198.228.182', port=65002, username='u754458241', password='@n9qe3KgL')

pkg_json = '{"name":"morsall","version":"1.0.0","scripts":{"start":"node server.js"}}'
cmd = f"echo '{pkg_json}' > /home/u754458241/domains/morsall.com/nodejs/package.json && cat /home/u754458241/domains/morsall.com/nodejs/package.json"
stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode())
print(stderr.read().decode())
client.close()
