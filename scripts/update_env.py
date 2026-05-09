import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('82.198.228.182', port=65002, username='u754458241', password='Code_2252')

commands = [
    'mkdir -p /home/u754458241/domains/morsall.com/public_html/uploads',
    'chmod 755 /home/u754458241/domains/morsall.com/public_html/uploads',
    'echo "INTERNAL_UPLOAD_PROXY_SECRET=Mersal_Internal_Proxy_2026" > /home/u754458241/domains/morsall.com/nodejs/.env',
    'echo "HOSTINGER_UPLOAD_HOST=82.198.228.182" >> /home/u754458241/domains/morsall.com/nodejs/.env',
    'echo "UPLOAD_DIR=/home/u754458241/domains/morsall.com/public_html/uploads" >> /home/u754458241/domains/morsall.com/nodejs/.env',
    'echo "NEXTAUTH_URL=https://morsall.com" >> /home/u754458241/domains/morsall.com/nodejs/.env',
    'echo "NEXTAUTH_SECRET=MersalEliteSecret2026" >> /home/u754458241/domains/morsall.com/nodejs/.env',
    'echo "DATABASE_URL=postgresql://neondb_owner:npg_jSskB54dWQti@ep-super-meadow-a4q1l2hn-pooler.us-east-1.aws.neon.tech/neondb?channel_binding=require&connect_timeout=15&sslmode=require" >> /home/u754458241/domains/morsall.com/nodejs/.env',
    'echo "POSTGRES_PRISMA_URL=postgresql://neondb_owner:npg_jSskB54dWQti@ep-super-meadow-a4q1l2hn-pooler.us-east-1.aws.neon.tech/neondb?channel_binding=require&connect_timeout=15&sslmode=require" >> /home/u754458241/domains/morsall.com/nodejs/.env',
    'echo "POSTGRES_URL_NON_POOLING=postgresql://neondb_owner:npg_jSskB54dWQti@ep-super-meadow-a4q1l2hn.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require" >> /home/u754458241/domains/morsall.com/nodejs/.env',
    'echo "PRISMA_CLIENT_ENGINE_TYPE=binary" >> /home/u754458241/domains/morsall.com/nodejs/.env'
]

for cmd in commands:
    print(f"Executing: {cmd}")
    client.exec_command(cmd)

client.close()
print("Successfully updated .env on Hostinger")
