import paramiko

def set_admin_direct():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        # PHP script to update the role to ADMIN and set a simple password
        php_code = """<?php
$user = 'u754458241_Kanan';
$pass = 'Code2252';
$dbname = 'u754458241_Kanan';

try {
    $pdo = new PDO("mysql:host=127.0.0.1;dbname=$dbname", $user, $pass);
    // 1. Find user
    $email = 'blackhatsd.sd@gmail.com';
    $new_pass = password_hash('Code2252', PASSWORD_DEFAULT);
    
    $stmt = $pdo->prepare("UPDATE User SET role = 'ADMIN', password = ? WHERE email = ?");
    $stmt->execute([$new_pass, $email]);
    
    if ($stmt->rowCount() > 0) {
        echo "SUCCESS: User $email is now ADMIN with password Code2252\\n";
    } else {
        echo "INFO: No user found with email $email or already updated.\\n";
        // Check if user exists
        $stmt = $pdo->prepare("SELECT id FROM User WHERE email = ?");
        $stmt->execute([$email]);
        if (!$stmt->fetch()) {
             echo "ERROR: User $email DOES NOT EXIST in database!\\n";
        }
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\\n";
}
?>"""
        sftp = client.open_sftp()
        sftp.file('/home/u754458241/domains/morsall.com/public_html/force_admin_direct.php', 'w').write(php_code)
        sftp.close()
        
        client.close()
        print("Done. Check https://morsall.com/force_admin_direct.php")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    set_admin_direct()
