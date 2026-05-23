import paramiko

def upload_super_db_tester():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    php_code = """<?php
header('Content-Type: text/plain');
$hosts = ['localhost', '127.0.0.1'];
$users = ['u754458241_Kanan', 'u754458241'];
$passwords = ['Mersal2026', 'Code_2252', '@n9qe3KgL', 'MersalEliteSecret2026'];
$dbname = 'u754458241_Kanan';

foreach ($hosts as $h) {
    foreach ($users as $u) {
        foreach ($passwords as $p) {
            try {
                $conn = new mysqli($h, $u, $p, $dbname);
                if (!$conn->connect_error) {
                    echo "SUCCESS (mysqli): Host=$h, User=$u, Pass=$p\\n";
                    $conn->close();
                    exit;
                }
            } catch (Exception $e) {}
            
            try {
                $pdo = new PDO("mysql:host=$h;dbname=$dbname", $u, $p);
                echo "SUCCESS (PDO): Host=$h, User=$u, Pass=$p\\n";
                exit;
            } catch (Exception $e) {}
        }
    }
}
echo "ULTIMATE FAILURE";
?>"""
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        sftp = client.open_sftp()
        sftp.file('/home/u754458241/domains/morsall.com/public_html/super_db_test.php', 'w').write(php_code)
        sftp.close()
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    upload_super_db_tester()
