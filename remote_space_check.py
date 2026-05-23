import paramiko

def php_space_check():
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
$passwords = ['Mersal2026', ' Mersal2026', 'Mersal2026 ', ' mersal2026', 'mersal2026'];
$user = 'u754458241_Kanan';
$dbname = 'u754458241_Kanan';

foreach ($passwords as $p) {
    try {
        $pdo = new PDO("mysql:host=localhost;dbname=$dbname;charset=utf8", $user, $p);
        echo "SUCCESS with password '$p'\\n";
        exit;
    } catch (Exception $e) {
    }
}
echo "ALL SPACE VARIANTS FAILED\\n";
?>"""
        
        sftp = client.open_sftp()
        sftp.file('/home/u754458241/domains/morsall.com/public_html/space_check.php', 'w').write(php_code)
        sftp.close()
        
        print("Running space check script...")
        stdin, stdout, stderr = client.exec_command('php /home/u754458241/domains/morsall.com/public_html/space_check.php')
        
        print("OUT:", stdout.read().decode())
        print("ERR:", stderr.read().decode())
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    php_space_check()
