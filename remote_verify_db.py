import paramiko

def node_db_verify():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        print(f"Connecting to {host}...")
        client.connect(host, port=port, username=user, password=pasw)
        
        js_code = """
const mysql = require('mysql2/promise');
async function main() {
  try {
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'u754458241_Kanan',
      password: 'Mersal2026',
      database: 'u754458241_Kanan'
    });
    console.log('SUCCESS: Connected to MySQL via node-mysql2');
    await connection.end();
  } catch (err) {
    console.error('FAILURE:', err.message);
  }
}
main();
"""
        
        sftp = client.open_sftp()
        sftp.file('/home/u754458241/domains/morsall.com/nodejs/verify_db.js', 'w').write(js_code)
        sftp.close()
        
        print("Running verify_db.js...")
        stdin, stdout, stderr = client.exec_command('cd /home/u754458241/domains/morsall.com/nodejs/ && /opt/alt/alt-nodejs22/root/usr/bin/node verify_db.js')
        
        print("OUT:", stdout.read().decode())
        print("ERR:", stderr.read().decode())
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    node_db_verify()
