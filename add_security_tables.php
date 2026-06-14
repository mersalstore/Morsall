<?php
header('Content-Type: text/plain; charset=utf-8');
$secret = $_GET['v'] ?? '';
if ($secret !== 'sec2026vixcell') die('Access Denied');

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

echo "\n=== Step 1: Create SecurityLog table ===\n";
try {
    $exists = (int) $pdo->query("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name='SecurityLog'")->fetchColumn();
    if (!$exists) {
        $pdo->exec("CREATE TABLE `SecurityLog` (
            `id` VARCHAR(191) NOT NULL,
            `type` VARCHAR(191) NOT NULL,
            `severity` VARCHAR(191) NOT NULL DEFAULT 'INFO',
            `ip` VARCHAR(191) NULL,
            `userAgent` TEXT NULL,
            `userId` VARCHAR(191) NULL,
            `userEmail` VARCHAR(191) NULL,
            `vendorId` VARCHAR(191) NULL,
            `endpoint` VARCHAR(500) NULL,
            `method` VARCHAR(191) NULL,
            `message` TEXT NULL,
            `details` JSON NULL,
            `resolved` BOOLEAN NOT NULL DEFAULT false,
            `resolvedBy` VARCHAR(191) NULL,
            `resolvedAt` DATETIME(3) NULL,
            `blocked` BOOLEAN NOT NULL DEFAULT false,
            `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
            PRIMARY KEY (`id`),
            INDEX `SecurityLog_type_idx`(`type`),
            INDEX `SecurityLog_severity_idx`(`severity`),
            INDEX `SecurityLog_ip_idx`(`ip`),
            INDEX `SecurityLog_userEmail_idx`(`userEmail`),
            INDEX `SecurityLog_createdAt_idx`(`createdAt`)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        echo "  ✅ Created SecurityLog table\n";
    } else {
        echo "  ✓ SecurityLog table already exists\n";
    }
} catch (Exception $e) {
    echo "  ❌ SecurityLog: " . $e->getMessage() . "\n";
}

echo "\n=== Step 2: Create BlockedIp table ===\n";
try {
    $exists = (int) $pdo->query("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name='BlockedIp'")->fetchColumn();
    if (!$exists) {
        $pdo->exec("CREATE TABLE `BlockedIp` (
            `id` VARCHAR(191) NOT NULL,
            `ip` VARCHAR(191) NOT NULL,
            `reason` TEXT NULL,
            `attempts` INT NOT NULL DEFAULT 0,
            `blockedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
            `expiresAt` DATETIME(3) NULL,
            `blockedBy` VARCHAR(191) NULL,
            PRIMARY KEY (`id`),
            UNIQUE INDEX `BlockedIp_ip_key`(`ip`),
            INDEX `BlockedIp_ip_idx`(`ip`),
            INDEX `BlockedIp_expiresAt_idx`(`expiresAt`)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        echo "  ✅ Created BlockedIp table\n";
    } else {
        echo "  ✓ BlockedIp table already exists\n";
    }
} catch (Exception $e) {
    echo "  ❌ BlockedIp: " . $e->getMessage() . "\n";
}

echo "\nDONE\n";
