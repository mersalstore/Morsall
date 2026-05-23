import paramiko

def php_detect_db():
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
$user = 'u754458241_Kanan';
$pass = 'Mersal2026';
$dbname = 'u754458241_Kanan';

foreach ($hosts as $h) {
    try {
        $pdo = new PDO("mysql:host=$h;dbname=$dbname;charset=utf8", $user, $pass);
        echo "SUCCESS with $h\\n";
        
        $email = 'blackhatsd.sd@gmail.com';
        $newPassword = 'Admin@Morsall2026';
        $hashed = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
        
        $stmt = $pdo->prepare("UPDATE User SET password = ?, role = 'ADMIN' WHERE email = ?");
        $stmt->execute([$hashed, $email]);
        if ($stmt->rowCount() > 0) {
            echo "User updated successfully!\\n";
        } else {
            // Try insert
            $id = 'cl' . bin2hex(random_bytes(8));
            $insert = $pdo->prepare("INSERT INTO User (id, email, password, role, name, createdAt, updatedAt) VALUES (?, ?, ?, 'ADMIN', 'Admin', NOW(), NOW())");
            $insert->execute([$id, $email, $hashed]);
            echo "User created successfully!\\n";
        }
        break;
    } catch (Exception $e) {
        echo "FAILED with $h: " . $e->getMessage() . "\\n";
    }
}
?>"""
        
        sftp = client.open_sftp()
        sftp.file('/home/u754458241/domains/morsall.com/public_html/db_detect.php', 'w').write(php_code)
        sftp.close()
        
        print("Running DB detect script...")
        stdin, stdout, stderr = client.exec_command('php /home/u754458241/domains/morsall.com/public_html/db_detect.php')
        
        print("OUT:", stdout.read().decode())
        print("ERR:", stderr.read().decode())
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    php_detect_db()
