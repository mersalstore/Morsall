import paramiko

def test_empty_pass():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    php_code = """<?php
header('Content-Type: text/plain');
$user = 'u754458241_Kanan';
$pass = '';
$dbname = 'u754458241_Kanan';

try {
    $pdo = new PDO("mysql:host=localhost;dbname=$dbname", $user, $pass);
    echo "SUCCESS with empty pass!\\n";
} catch (Exception $e) {
    echo "FAILED with empty pass: " . $e->getMessage() . "\\n";
}
?>"""
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        sftp = client.open_sftp()
        sftp.file('/home/u754458241/domains/morsall.com/public_html/test_empty.php', 'w').write(php_code)
        sftp.close()
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_empty_pass()
