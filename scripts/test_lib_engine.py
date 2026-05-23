import paramiko

def test_library_engine():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        js_code = """
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'binary';
process.env.TOKIO_WORKER_THREADS = '1';
process.env.UV_THREADPOOL_SIZE = '1';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    try {
        const count = await prisma.user.count();
        console.log('LIB_SUCCESS: ' + count);
    } catch (e) {
        console.log('LIB_ERROR: ' + e.message);
    } finally {
        await prisma.$disconnect();
    }
}
main();
"""
        sftp = client.open_sftp()
        sftp.file('/home/u754458241/domains/morsall.com/nodejs/test_lib.js', 'w').write(js_code)
        sftp.close()
        
        node_bin = '/opt/alt/alt-nodejs22/root/usr/bin/node'
        stdin, stdout, stderr = client.exec_command(f'cd /home/u754458241/domains/morsall.com/nodejs/ && {node_bin} test_lib.js')
        print(stdout.read().decode())
        print(stderr.read().decode())
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_library_engine()
