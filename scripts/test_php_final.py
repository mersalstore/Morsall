import paramiko

def test_php_code2252():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        php_code = """<?php
header('Content-Type: text/plain');
$user = 'u754458241_Kanan';
$pass = 'Code2252';
$dbname = 'u754458241_Kanan';

try {
    $pdo = new PDO("mysql:host=127.0.0.1;dbname=$dbname", $user, $pass);
    echo "SUCCESS_PHP_DB\\n";
    $stmt = $pdo->query("SELECT COUNT(*) FROM User");
    echo "USER_COUNT: " . $stmt->fetchColumn() . "\\n";
} catch (Exception $e) {
    echo "FAILED_PHP_DB: " . $e->getMessage() . "\\n";
}
?>"""
        sftp = client.open_sftp()
        sftp.file('/home/u754458241/domains/morsall.com/public_html/test_php_new.php', 'w').write(php_code)
        sftp.close()
        
        client.close()
        print("Done. Check https://morsall.com/test_php_new.php")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_php_code2252()
