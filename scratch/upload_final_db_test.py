import paramiko

def upload_final_db_tester():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    php_code = """<?php
$passwords = ['Mersal2026', 'Code_2252', '@n9qe3KgL', 'MersalEliteSecret2026', 'MersalElite2026', 'Kanan2026'];
$user = 'u754458241_Kanan';
$dbname = 'u754458241_Kanan';

foreach ($passwords as $p) {
    try {
        $pdo = new PDO("mysql:host=localhost;dbname=$dbname", $user, $p);
        echo "SUCCESS: $p\\n";
        exit;
    } catch (Exception $e) {}
}
echo "ALL FAILED";
?>"""
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        sftp = client.open_sftp()
        sftp.file('/home/u754458241/domains/morsall.com/public_html/final_db_test.php', 'w').write(php_code)
        sftp.close()
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    upload_final_db_tester()
