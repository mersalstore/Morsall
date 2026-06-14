<?php
header('Content-Type: text/plain; charset=utf-8');
$host = '127.0.0.1';
$db   = 'u754458241_Kanan';
$user = 'u754458241_Kanan';
$pass = 'CODe_2222';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
     echo "Connection SUCCESS.

";
     
     // 1. Show database tables
     $stmt = $pdo->query('SHOW TABLES');
     echo "Tables:
";
     while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
         echo "- " . $row[0] . "
";
     }
     echo "
";
     
     // 2. Count users by role
     $stmt = $pdo->query('SELECT role, COUNT(*) as cnt FROM User GROUP BY role');
     echo "Users by Role:
";
     while ($row = $stmt->fetch()) {
         echo "- " . $row['role'] . ": " . $row['cnt'] . "
";
     }
     echo "
";
     
     // 3. Show blackhatsd user
     $stmt = $pdo->prepare('SELECT id, email, name, role, password FROM User WHERE email = ?');
     $stmt->execute(['blackhatsd.sd@gmail.com']);
     $u = $stmt->fetch();
     if ($u) {
         echo sprintf("Found User - ID: %s, Email: %s, Name: %s, Role: %s, HasPassword: %d
",
             $u['id'], $u['email'], $u['name'], $u['role'], !empty($u['password']));
     } else {
         echo "User blackhatsd.sd@gmail.com not found!
";
     }
     echo "
";
     
} catch (\PDOException $e) {
     echo "PDO Connection Error: " . $e->getMessage() . "
";
}
?>