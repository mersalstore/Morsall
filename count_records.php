<?php
header('Content-Type: text/plain; charset=utf-8');
$secret = $_GET['v'] ?? '';
if ($secret !== 'count2026vixcell') {
    die('Access Denied');
}

// Pick first .env that has a working DATABASE_URL
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
            "mysql:host=$um[3];port=" . (!empty($um[4]) ? $um[4] : '3306') . ";dbname=$um[5];charset=utf8mb4",
            $um[1], $um[2], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        break;
    } catch (Exception $e) {}
}

if (!$pdo) die("Could not connect to DB\n");

$tables = ['User','Vendor','SubscriptionPlan','Product','Category','Order','OrderItem','Notification','SubscriptionPlan','PaymentTransaction','CustomDesignRequest','Settings','SiteConfig','SiteBanner','Employee','DeliveryDriver','Coupon','VendorReview','Review','Branch','Withdrawal','Attribute','SavedAddress'];

echo "=== RECORD COUNTS ===\n";
foreach (array_unique($tables) as $t) {
    try {
        $c = (int) $pdo->query("SELECT COUNT(*) FROM `$t`")->fetchColumn();
        printf("  %-25s %s\n", $t, $c);
    } catch (Exception $e) {
        printf("  %-25s MISSING/ERROR (%s)\n", $t, $e->getCode());
    }
}

echo "\n=== ACTIVE PRODUCTS (status=APPROVED) ===\n";
try {
    $c = (int) $pdo->query("SELECT COUNT(*) FROM Product WHERE status='APPROVED'")->fetchColumn();
    echo "  Approved products: $c\n";
    $c2 = (int) $pdo->query("SELECT COUNT(*) FROM Product WHERE status='PENDING'")->fetchColumn();
    echo "  Pending products: $c2\n";
} catch (Exception $e) {
    echo "  Error: " . $e->getMessage() . "\n";
}

echo "\n=== ACTIVE VENDORS (status=APPROVED) ===\n";
try {
    $rows = $pdo->query("SELECT status, COUNT(*) as n FROM Vendor GROUP BY status")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($rows as $r) printf("  %-15s %s\n", $r['status'], $r['n']);
} catch (Exception $e) {
    echo "  Error: " . $e->getMessage() . "\n";
}

echo "\n=== ORDERS BY STATUS ===\n";
try {
    $rows = $pdo->query("SELECT status, COUNT(*) as n FROM `Order` GROUP BY status")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($rows as $r) printf("  %-20s %s\n", $r['status'], $r['n']);
} catch (Exception $e) {
    echo "  Error: " . $e->getMessage() . "\n";
}

echo "\nDONE\n";
