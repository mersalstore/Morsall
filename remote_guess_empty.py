import paramiko

def php_guess_empty():
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
$hosts = ['localhost', '127.0.0.1'];
$passwords = ['', 'root', 'admin'];
$user = 'u754458241_Kanan';
$dbname = 'u754458241_Kanan';

foreach ($hosts as $h) {
    foreach ($passwords as $p) {
        try {
            $pdo = new PDO("mysql:host=$h;dbname=$dbname;charset=utf8", $user, $p);
            echo "SUCCESS with $h and password '$p'\\n";
            exit;
        } catch (Exception $e) {
        }
    }
}
echo "EMPTY GUESSES FAILED\\n";
?>"""
        
        sftp = client.open_sftp()
        sftp.file('/home/u754458241/domains/morsall.com/public_html/guess_empty.php', 'w').write(php_code)
        sftp.close()
        
        print("Running Empty guess script...")
        stdin, stdout, stderr = client.exec_command('php /home/u754458241/domains/morsall.com/public_html/guess_empty.php')
        
        print("OUT:", stdout.read().decode())
        print("ERR:", stderr.read().decode())
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    php_guess_empty()
