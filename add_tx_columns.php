<?php
header('Content-Type: text/plain; charset=utf-8');
$secret = $_GET['v'] ?? '';
if ($secret !== 'addcols2026vixcell') {
    die('Access Denied');
}

// Get DB from .env
$envPaths = [
    '/home/u754458241/domains/morsall.com/nodejs/.env',
    '/home/u754458241/domains/morsall.com/nodejs/.env.production',
];

$pdo = null;
foreach ($envPaths as $p) {
    if (!file_exists($p)) continue;
    $envText = file_get_contents($p);
    if (!preg_match('/^\s*DATABASE_URL\s*=\s*["\']?([^"\'\n\r]+)/m', $envText, $m)) continue;
    if (!preg_match('#^mysql://([^:]+):([^@]+)@([^:/]+)(?::(\d+))?/([^?\s]+)#', $m[1], $um)) continue;
    try {
        $pdo = new PDO(
            "mysql:host={$um[3]};port=" . (!empty($um[4]) ? $um[4] : '3306') . ";dbname={$um[5]};charset=utf8mb4",
            $um[1], $um[2], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        echo "Connected via " . basename($p) . "\n";
        break;
    } catch (Exception $e) {}
}

if (!$pdo) die("Could not connect\n");

$cols = [
    'screenshotUrl' => "ALTER TABLE PaymentTransaction ADD COLUMN screenshotUrl TEXT NULL",
    'aiConfidence'  => "ALTER TABLE PaymentTransaction ADD COLUMN aiConfidence DOUBLE NULL",
    'aiData'        => "ALTER TABLE PaymentTransaction ADD COLUMN aiData JSON NULL",
    'notes'         => "ALTER TABLE PaymentTransaction ADD COLUMN notes TEXT NULL",
];

foreach ($cols as $col => $ddl) {
    try {
        $exists = (int) $pdo->query("SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='PaymentTransaction' AND column_name='$col'")->fetchColumn();
        if ($exists) {
            echo "  ✓ $col already exists\n";
        } else {
            $pdo->exec($ddl);
            echo "  ✅ Added $col\n";
        }
    } catch (Exception $e) {
        echo "  ❌ $col: " . $e->getMessage() . "\n";
    }
}

echo "\nDone.\n";
