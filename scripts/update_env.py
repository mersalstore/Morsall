import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('82.198.228.182', port=65002, username='u754458241', password='Code_2252')

commands = [
    'echo "INTERNAL_UPLOAD_PROXY_SECRET=Mersal_Internal_Proxy_2026" >> /home/u754458241/domains/morsall.com/public_html/.builds/source/.env',
    'echo "HOSTINGER_UPLOAD_HOST=82.198.228.182" >> /home/u754458241/domains/morsall.com/public_html/.builds/source/.env',
    'echo "UPLOAD_DIR=public/uploads" >> /home/u754458241/domains/morsall.com/public_html/.builds/source/.env'
]

for cmd in commands:
    client.exec_command(cmd)

client.close()
print("Successfully updated .env on Hostinger")
