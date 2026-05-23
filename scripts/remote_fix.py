import paramiko
import os

def run_remote_fix():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        print(f"Connecting to {host}...")
        client.connect(host, port=port, username=user, password=pasw)
        
        # 3. Check DB connection via Prisma
        print("Testing Prisma DB connection...")
        prisma_test = """
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    try {
        const user = await prisma.user.findFirst();
        console.log('DB_SUCCESS');
    } catch (e) {
        console.log('DB_ERROR: ' + e.message);
    } finally {
        await prisma.$disconnect();
    }
}
main();
"""
        sftp = client.open_sftp()
        sftp.file('/home/u754458241/nodeapp/test_prisma.js', 'w').write(prisma_test)
        sftp.close()
        
        node_bin = '/opt/alt/alt-nodejs22/root/usr/bin/node'
        stdin, stdout, stderr = client.exec_command(f'cd /home/u754458241/nodeapp/ && {node_bin} test_prisma.js')
        res = stdout.read().decode().strip()
        print(f"Prisma Result: {res}")
        if 'DB_SUCCESS' in res:
            print("Prisma is working!")
        else:
            print(f"Prisma FAILED: {res}")
            err = stderr.read().decode()
            if err:
                print(f"Prisma Error: {err}")

        # 4. Restart Node process
        print("Restarting server...")
        client.exec_command(f'touch /home/u754458241/nodeapp/tmp/restart.txt')
        
        print("Fix applied successfully.")
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    run_remote_fix()
