import paramiko
hostname = '82.198.228.182'
port = 65002
username = 'u754458241'
password = '@n9qe3KgL'
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password)

content = """
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';
// Try socket connection
process.env.DATABASE_URL = 'mysql://u754458241_Kanan:%40n9qe3KgL@localhost/u754458241_Kanan?socket=/var/lib/mysql/mysql.sock';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    console.log('Connecting to DB via socket...');
    const users = await prisma.user.findMany({ take: 1 });
    console.log('Success! Users found:', users.length);
  } catch (e) {
    console.error('Connection failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
"""
sftp = client.open_sftp()
with sftp.file('/home/u754458241/nodeapp/debug_prisma.js', 'w') as f:
    f.write(content)
sftp.close()

stdin, stdout, stderr = client.exec_command('cd /home/u754458241/nodeapp && /opt/alt/alt-nodejs20/root/usr/bin/node debug_prisma.js')
import sys
sys.stdout.reconfigure(encoding='utf-8')
print("STDOUT:", stdout.read().decode())
print("STDERR:", stderr.read().decode())
client.close()
