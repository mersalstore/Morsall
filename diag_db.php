<?php
header('Content-Type: text/plain; charset=utf-8');
$secret = $_GET['v'] ?? '';
if ($secret !== '2026') {
    die('Access Denied');
}

// Parse DATABASE_URL from .env.production
$envPath = '/home/u754458241/domains/morsall.com/nodejs/.env.production';
if (!file_exists($envPath)) die("env not found at $envPath");
$envText = file_get_contents($envPath);
preg_match('/DATABASE_URL=["\']?([^"\'\n]+)/', $envText, $m);
$url = $m[1] ?? '';
if (!$url) die("DATABASE_URL not found");

// Parse mysql://user:pass@host/dbname
preg_match('#^mysql://([^:]+):([^@]+)@([^/]+)/(.+)$#', $url, $um);
[$_, $user, $pass, $host, $db] = $um;

echo "Host: $host\nDB: $db\nUser: $user\n\n";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
} catch (Exception $e) {
    die("DB connect failed: " . $e->getMessage());
}

echo "=== TABLES IN DB ===\n";
$stmt = $pdo->query("SHOW TABLES");
$tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
foreach ($tables as $t) echo "  $t\n";

echo "\n=== KEY TABLE PRESENCE ===\n";
$expected = ['User', 'Vendor', 'SubscriptionPlan', 'PaymentTransaction', 'CustomDesignRequest', 'Notification', 'SiteConfig', 'Settings'];
foreach ($expected as $t) {
    $present = in_array($t, $tables) ? 'YES' : 'MISSING';
    echo "  $t: $present\n";
}

echo "\n=== SubscriptionPlan ROWS ===\n";
if (in_array('SubscriptionPlan', $tables)) {
    // List columns
    $cols = $pdo->query("DESCRIBE SubscriptionPlan")->fetchAll(PDO::FETCH_ASSOC);
    echo "Columns:\n";
    foreach ($cols as $c) {
        echo "  {$c['Field']} ({$c['Type']}) null={$c['Null']}\n";
    }

    $rows = $pdo->query("SELECT id, name, slug, price, durationDays, isTrial FROM SubscriptionPlan")->fetchAll(PDO::FETCH_ASSOC);
    echo "\nRows (" . count($rows) . " total):\n";
    foreach ($rows as $r) {
        echo "  id={$r['id']}, name={$r['name']}, slug=" . ($r['slug'] ?? 'NULL') . ", price={$r['price']}, days={$r['durationDays']}, trial={$r['isTrial']}\n";
    }

    $null = $pdo->query("SELECT COUNT(*) FROM SubscriptionPlan WHERE slug IS NULL")->fetchColumn();
    echo "\nNULL slugs: $null\n";
}

echo "\n=== Vendor COLUMNS ===\n";
$cols = $pdo->query("DESCRIBE Vendor")->fetchAll(PDO::FETCH_ASSOC);
foreach ($cols as $c) {
    if (in_array($c['Field'], ['tier', 'planId', 'subscriptionEndsAt', 'storeBanner', 'storeDesign', 'storeDescription'])) {
        echo "  {$c['Field']} ({$c['Type']}) null={$c['Null']}\n";
    }
}

echo "\nDone.\n";
