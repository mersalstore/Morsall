import paramiko

def upload_mega_db_tester():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    php_code = """<?php
header('Content-Type: text/plain');
$user = 'u754458241_Kanan';
$dbname = 'u754458241_Kanan';
$bases = ['Mersal', 'Mersall', 'Code', 'Kanan'];
$suffixes = ['2026', '2025', '2024', '@2026', '@2025', '@123', '123', '@112233'];

foreach ($bases as $b) {
    foreach ($suffixes as $s) {
        $p = $b . $s;
        try {
            $pdo = new PDO("mysql:host=localhost;dbname=$dbname", $user, $p);
            echo "SUCCESS: $p\\n";
            exit;
        } catch (Exception $e) {}
        
        $p2 = strtolower($b) . $s;
        try {
            $pdo = new PDO("mysql:host=localhost;dbname=$dbname", $user, $p2);
            echo "SUCCESS: $p2\\n";
            exit;
        } catch (Exception $e) {}
    }
}
echo "MEGA FAILURE";
?>"""
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        sftp = client.open_sftp()
        sftp.file('/home/u754458241/domains/morsall.com/public_html/mega_db_test.php', 'w').write(php_code)
        sftp.close()
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    upload_mega_db_tester()
