<?php
/**
 * Set Admin Password Tool
 * يضيف كلمة مرور لحساب الأدمن المسجل بجوجل
 * URL: https://morsall.com/set_admin_pass.php?key=morsall2026
 */
header('Content-Type: text/html; charset=utf-8');

$secret = $_GET['key'] ?? '';
if ($secret !== 'morsall2026') {
    die('Access Denied');
}

echo "<pre style='font-family:monospace;font-size:14px;direction:ltr'>";
echo "=== SET ADMIN PASSWORD ===\n\n";

// Read DB Config from .env file
$envPath = __DIR__ . '/app_new/.env';
$envVars = [];
if (file_exists($envPath)) {
    foreach (file($envPath) as $line) {
        $line = trim($line);
        if (strpos($line, '=') !== false && $line[0] !== '#') {
            [$k, $v] = explode('=', $line, 2);
            $envVars[trim($k)] = trim($v, " \t\n\r\0\x0B\"'");
        }
    }
}

// Parse DATABASE_URL: mysql://user:pass@host/dbname
$dbUrl = $envVars['DATABASE_URL'] ?? 'mysql://u754458241_Kanan:Code_2252@127.0.0.1/u754458241_Kanan';
echo "DB URL: " . preg_replace('/:[^:@]+@/', ':***@', $dbUrl) . "\n";

$parsed = parse_url($dbUrl);
$host   = $parsed['host'] ?? '127.0.0.1';
$dbname = ltrim($parsed['path'] ?? '/u754458241_Kanan', '/');
$user   = urldecode($parsed['user'] ?? 'u754458241_Kanan');
$pass   = urldecode($parsed['pass'] ?? 'Code_2252');

$email = 'blackhatsd.sd@gmail.com';
// كلمة المرور الجديدة
$newPassword = $_GET['pwd'] ?? 'Admin@Morsall2026';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ DB Connected\n\n";

    // Check user
    $stmt = $pdo->prepare("SELECT id, name, email, role, password FROM User WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $dbUser = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$dbUser) {
        echo "❌ User not found: $email\n";
        echo "\n--- All Users ---\n";
        $all = $pdo->query("SELECT email, role FROM User ORDER BY createdAt DESC LIMIT 10")->fetchAll();
        foreach ($all as $u) echo "  {$u['email']} => {$u['role']}\n";
        exit;
    }

    echo "👤 Found: {$dbUser['name']} ({$dbUser['email']})\n";
    echo "📌 Role: {$dbUser['role']}\n";
    echo "🔑 Has password: " . (!empty($dbUser['password']) ? 'YES' : 'NO') . "\n\n";

    // Hash password using PHP password_hash (bcrypt compatible)
    $hashed = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);

    // Update
    $update = $pdo->prepare("UPDATE User SET password = ?, role = 'ADMIN' WHERE email = ?");
    $update->execute([$hashed, $email]);

    echo "✅ Password set successfully!\n";
    echo "📧 Email: $email\n";
    echo "🔑 New Password: $newPassword\n";
    echo "👑 Role: ADMIN\n\n";
    echo "✨ Now you can login with email + password!\n";
    echo "\n⚠️  DELETE THIS FILE AFTER USE!\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
echo "</pre>";
