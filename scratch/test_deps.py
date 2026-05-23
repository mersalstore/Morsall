import paramiko
hostname = '82.198.228.182'
port = 65002
username = 'u754458241'
password = '@n9qe3KgL'
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password)

content = """
try {
    const next = require('next/package.json');
    console.log('Next.js version:', next.version);
    const prisma = require('@prisma/client');
    console.log('Prisma client found');
} catch (e) {
    console.error('Error:', e.message);
}
"""
sftp = client.open_sftp()
with sftp.file('/home/u754458241/nodeapp/test_deps.js', 'w') as f:
    f.write(content)
sftp.close()

stdin, stdout, stderr = client.exec_command('cd /home/u754458241/nodeapp && /opt/alt/alt-nodejs20/root/usr/bin/node test_deps.js')
print("STDOUT:", stdout.read().decode())
print("STDERR:", stderr.read().decode())
client.close()
