import paramiko

def php_set_admin_retry():
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
$pass = 'Code_2252';

$email = 'blackhatsd.sd@gmail.com';
$newPassword = 'Admin@Morsall2026';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $hashed = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
    $stmt = $pdo->prepare("UPDATE User SET password = ?, role = 'ADMIN' WHERE email = ?");
    $stmt->execute([$hashed, $email]);
    if ($stmt->rowCount() > 0) {
        echo "SUCCESS: User updated to ADMIN\\n";
    } else {
        $id = 'cl' . bin2hex(random_bytes(8));
        $insert = $pdo->prepare("INSERT INTO User (id, email, password, role, name, createdAt, updatedAt) VALUES (?, ?, ?, 'ADMIN', 'Admin', NOW(), NOW())");
        $insert->execute([$id, $email, $hashed]);
        echo "SUCCESS: User created as ADMIN\\n";
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\\n";
}
?>"""
        
        sftp = client.open_sftp()
        sftp.file('/home/u754458241/domains/morsall.com/public_html/set_admin_manual.php', 'w').write(php_code)
        sftp.close()
        
        print("Running PHP script via web request...")
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    php_set_admin_retry()
