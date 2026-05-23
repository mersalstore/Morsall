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
    const next = require('next');
    const app = next({ dev: false, dir: __dirname });
    console.log('Next.js initialized');
    app.prepare().then(() => {
        console.log('Next.js prepared');
        process.exit(0);
    }).catch(e => {
        console.error('Prepare error:', e);
        process.exit(1);
    });
} catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
}
"""
sftp = client.open_sftp()
with sftp.file('/home/u754458241/nodeapp/test_next.js', 'w') as f:
    f.write(content)
sftp.close()

stdin, stdout, stderr = client.exec_command('cd /home/u754458241/nodeapp && /opt/alt/alt-nodejs20/root/usr/bin/node test_next.js')
print("STDOUT:", stdout.read().decode())
print("STDERR:", stderr.read().decode())
client.close()
