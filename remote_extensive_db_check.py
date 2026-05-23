import paramiko

def php_extensive_db_check():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        print(f"Connecting to {host}...")
        client.connect(host, port=port, username=user, password=pasw)
        
        php_code = """<?php
$hosts = ['localhost', '127.0.0.1', 'mysql.morsall.com', 'sql.morsall.com', '82.198.228.182'];
$users = ['u754458241_Kanan', 'u754458241'];
$pass = 'Mersal2026';
$dbname = 'u754458241_Kanan';

foreach ($hosts as $h) {
    foreach ($users as $u) {
        try {
            $pdo = new PDO("mysql:host=$h;dbname=$dbname;charset=utf8", $u, $pass);
            echo "SUCCESS: Host=$h, User=$u, Password=$pass\\n";
            exit;
        } catch (Exception $e) {
            // echo "FAILED: Host=$h, User=$u -> " . $e->getMessage() . "\\n";
        }
    }
}
echo "ALL ATTEMPTS FAILED\\n";
?>"""
        
        sftp = client.open_sftp()
        sftp.file('/home/u754458241/domains/morsall.com/public_html/extensive_db_check.php', 'w').write(php_code)
        sftp.close()
        
        print("Running extensive DB check script...")
        stdin, stdout, stderr = client.exec_command('php /home/u754458241/domains/morsall.com/public_html/extensive_db_check.php')
        
        print("OUT:", stdout.read().decode())
        print("ERR:", stderr.read().decode())
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    php_extensive_db_check()
