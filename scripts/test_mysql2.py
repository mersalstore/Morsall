import paramiko

def test_mysql2():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        js_test = """
const mysql = require('mysql2/promise');
async function main() {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'u754458241_Kanan',
            password: 'l$9Qs3i]g0y]/V~k',
            database: 'u754458241_Kanan'
        });
        console.log('MYSQL2_SUCCESS');
        await conn.end();
    } catch (e) {
        console.log('MYSQL2_ERROR: ' + e.message);
    }
}
main();
"""
        sftp = client.open_sftp()
        sftp.file('/home/u754458241/nodeapp/test_mysql2.js', 'w').write(js_test)
        sftp.close()
        
        node_bin = '/opt/alt/alt-nodejs22/root/usr/bin/node'
        stdin, stdout, stderr = client.exec_command(f'cd /home/u754458241/nodeapp/ && {node_bin} test_mysql2.js')
        res = stdout.read().decode().strip()
        print(f"Result: {res}")
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_mysql2()
