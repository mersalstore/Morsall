import paramiko

def php_list_dbs():
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
$user = 'u754458241_Kanan';
$pass = 'Mersal2026';
try {
    $pdo = new PDO("mysql:host=127.0.0.1", $user, $pass);
    $dbs = $pdo->query("SHOW DATABASES")->fetchAll(PDO::FETCH_COLUMN);
    echo "DATABASES: " . implode(", ", $dbs) . "\\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\\n";
}
?>"""
        
        sftp = client.open_sftp()
        sftp.file('/home/u754458241/domains/morsall.com/public_html/list_dbs.php', 'w').write(php_code)
        sftp.close()
        
        print("Running list_dbs.php...")
        stdin, stdout, stderr = client.exec_command('php /home/u754458241/domains/morsall.com/public_html/list_dbs.php')
        
        print("OUT:", stdout.read().decode())
        print("ERR:", stderr.read().decode())
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    php_list_dbs()
