import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('82.198.228.182', port=65002, username='u754458241', password='Code_2252')

commands = [
    'echo "HOSTINGER_UPLOAD_TARGETS=http://82.198.228.182/api/upload,https://morsall.com/api/upload" >> /home/u754458241/domains/morsall.com/public_html/.builds/source/.env',
    'echo "UPLOAD_PROXY_TIMEOUT_MS=15000" >> /home/u754458241/domains/morsall.com/public_html/.builds/source/.env'
]

for cmd in commands:
    client.exec_command(cmd)

client.close()
print("Successfully updated proxy targets on Hostinger")
