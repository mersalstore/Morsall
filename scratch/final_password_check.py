import paramiko

def final_password_check():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    php_code = """<?php
header('Content-Type: text/plain');
$user = 'u754458241_Kanan';
$pass = 'Mersal2026';
$hosts = ['localhost', '127.0.0.1'];

foreach ($hosts as $h) {
    try {
        $pdo = new PDO("mysql:host=$h", $user, $pass);
        echo "SUCCESS with host $h\\n";
        $dbs = $pdo->query("SHOW DATABASES")->fetchAll(PDO::FETCH_COLUMN);
        echo "DBS: " . implode(", ", $dbs) . "\\n";
        exit;
    } catch (Exception $e) {
        echo "FAILED with host $h: " . $e->getMessage() . "\\n";
    }
}
?>"""
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        sftp = client.open_sftp()
        sftp.file('/home/u754458241/domains/morsall.com/public_html/final_check.php', 'w').write(php_code)
        sftp.close()
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    final_password_check()
