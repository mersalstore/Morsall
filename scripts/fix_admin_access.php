<?php
/**
 * MORSALL ADMIN & DATABASE REPAIR
 * This script fixes the admin user role and password directly in the database.
 */

header('Content-Type: text/plain');
echo "--- MORSALL ADMIN REPAIR STARTING ---\n";

$host = 'localhost';
$user = 'u754458241_Kanan';
$pass = '4aE1b?DI|'; // The correct password we found
$db   = 'u754458241_Kanan';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Successfully connected to Database.\n";

    $email = 'blackhatsd.sd@gmail.com';
    $new_pass = 'MersalAdmin2026';
    $hashed_pass = password_hash($new_pass, PASSWORD_BCRYPT);

    // Check if user exists
    $stmt = $pdo->prepare("SELECT id FROM User WHERE email = ?");
    $stmt->execute([$email]);
    $u = $stmt->fetch();

    if ($u) {
        echo "User $email found. Updating role and password...\n";
        $stmt = $pdo->prepare("UPDATE User SET role = 'ADMIN', password = ? WHERE email = ?");
        $stmt->execute([$hashed_pass, $email]);
        echo "SUCCESS: Admin access restored for $email\n";
    } else {
        echo "User $email NOT FOUND. Creating new Admin user...\n";
        $stmt = $pdo->prepare("INSERT INTO User (id, name, email, password, role, emailVerified) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([uniqid('u_'), 'Admin', $email, $hashed_pass, 'ADMIN', date('Y-m-d H:i:s')]);
        echo "SUCCESS: New Admin user created.\n";
    }

    echo "\nLOGIN DETAILS:\n";
    echo "URL: https://morsall.com/login\n";
    echo "Email: $email\n";
    echo "Password: $new_pass\n";

} catch (PDOException $e) {
    echo "DATABASE ERROR: " . $e->getMessage() . "\n";
}

echo "\n--- REPAIR COMPLETED ---\n";
?>
