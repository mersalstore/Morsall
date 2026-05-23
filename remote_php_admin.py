import paramiko

def php_set_admin():
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
$host = '127.0.0.1';
$dbname = 'u754458241_Kanan';
$user = 'u754458241_Kanan';
$pass = 'Mersal2026';

$email = 'blackhatsd.sd@gmail.com';
$newPassword = 'Admin@Morsall2026';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Hash password (bcrypt)
    $hashed = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
    
    // Check if user exists
    $stmt = $pdo->prepare("SELECT id FROM User WHERE email = ?");
    $stmt->execute([$email]);
    $existing = $stmt->fetch();
    
    if ($existing) {
        $update = $pdo->prepare("UPDATE User SET password = ?, role = 'ADMIN' WHERE email = ?");
        $update->execute([$hashed, $email]);
        echo "SUCCESS: User updated to ADMIN\\n";
    } else {
        $insert = $pdo->prepare("INSERT INTO User (id, email, password, role, name, createdAt, updatedAt) VALUES (?, ?, ?, 'ADMIN', 'Admin', NOW(), NOW())");
        $insert->execute([uniqid('cl'), $email, $hashed]);
        echo "SUCCESS: User created as ADMIN\\n";
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\\n";
}
?>"""
        
        sftp = client.open_sftp()
        sftp.file('/home/u754458241/domains/morsall.com/public_html/set_admin_manual.php', 'w').write(php_code)
        sftp.close()
        
        print("Running PHP script via SSH...")
        stdin, stdout, stderr = client.exec_command('php /home/u754458241/domains/morsall.com/public_html/set_admin_manual.php')
        
        print("OUT:", stdout.read().decode())
        print("ERR:", stderr.read().decode())
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    php_set_admin()
