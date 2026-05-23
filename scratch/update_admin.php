<?php
$h = 'localhost';
$u = 'u754458241_Kanan';
$p = 'Code2252';
$d = 'u754458241_Kanan';

try {
    $pdo = new PDO("mysql:host=$h;dbname=$d;charset=utf8", $u, $p);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $email = 'Blackhatsd.sd@gmail.com';
    $password = 'MersalAdmin2026';
    $hashed = password_hash($password, PASSWORD_BCRYPT);
    
    $stmt = $pdo->prepare("UPDATE User SET role = 'ADMIN', password = ? WHERE email = ?");
    $stmt->execute([$hashed, $email]);
    
    if ($stmt->rowCount() > 0) {
        echo "SUCCESS: Admin $email updated with password $password\n";
    } else {
        // Maybe it's already set or user doesn't exist (check case)
        $stmt = $pdo->prepare("SELECT id FROM User WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            echo "NOTICE: Admin $email found, but no changes made (maybe password already same)\n";
        } else {
            echo "ERROR: User $email not found\n";
        }
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
