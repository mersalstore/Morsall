<?php
header('Content-Type: text/plain; charset=utf-8');
$secret = $_GET['v'] ?? '';
if ($secret !== 'fix2026vixcell') {
    die('Access Denied');
}

// Read DATABASE_URL from .env files (try .env first as Prisma does, then .env.production)
$envPaths = [
    '/home/u754458241/domains/morsall.com/nodejs/.env',
    '/home/u754458241/domains/morsall.com/nodejs/.env.production',
];

$url = null;
$urlSource = '';
$urlsFound = [];
foreach ($envPaths as $p) {
    if (file_exists($p)) {
        $envText = file_get_contents($p);
        if (preg_match('/^\s*DATABASE_URL\s*=\s*["\']?([^"\'\n\r]+)/m', $envText, $m)) {
            $urlsFound[] = ['source' => basename($p), 'url' => $m[1]];
        }
    }
}
if (empty($urlsFound)) die("DATABASE_URL not found in any .env file");

// Pick the one that actually connects
foreach ($urlsFound as $candidate) {
    if (!preg_match('#^mysql://([^:]+):([^@]+)@([^:/]+)(?::(\d+))?/([^?\s]+)#', $candidate['url'], $um)) continue;
    $testUser = $um[1];
    $testPass = $um[2];
    $testHost = $um[3];
    $testPort = !empty($um[4]) ? (int)$um[4] : 3306;
    $testDb = $um[5];
    try {
        $testPdo = new PDO("mysql:host=$testHost;port=$testPort;dbname=$testDb;charset=utf8mb4", $testUser, $testPass);
        $url = $candidate['url'];
        $urlSource = $candidate['source'];
        echo "Selected source: $urlSource\n";
        break;
    } catch (Exception $e) {
        echo "Trying $candidate[source] -> failed: " . $e->getMessage() . "\n";
    }
}
if (!$url) die("\nNo working DATABASE_URL found in any .env file");

if (!preg_match('#^mysql://([^:]+):([^@]+)@([^:/]+)(?::(\d+))?/([^?\s]+)#', $url, $um)) {
    die("Could not parse DATABASE_URL format");
}
$user = $um[1];
$pass = $um[2];
$host = $um[3];
$port = !empty($um[4]) ? (int)$um[4] : 3306;
$db   = $um[5];

echo "Connecting to $host:$port (db=$db, user=" . substr($user,0,4) . "***)...\n";

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
} catch (Exception $e) {
    die("DB connect failed: " . $e->getMessage());
}
echo "Connected.\n\n";

// 1. Check & fix NULL slugs on SubscriptionPlan
echo "=== Step 1: Check SubscriptionPlan slugs ===\n";
try {
    $cnt = (int) $pdo->query("SELECT COUNT(*) FROM SubscriptionPlan WHERE slug IS NULL OR slug = ''")->fetchColumn();
    echo "NULL/empty slugs: $cnt\n";
    if ($cnt > 0) {
        $rows = $pdo->query("SELECT id, name FROM SubscriptionPlan WHERE slug IS NULL OR slug = ''")->fetchAll(PDO::FETCH_ASSOC);
        $stmt = $pdo->prepare("UPDATE SubscriptionPlan SET slug = :slug WHERE id = :id");
        foreach ($rows as $i => $r) {
            $newSlug = 'legacy-' . substr($r['id'], 0, 8) . '-' . (time() + $i);
            $stmt->execute([':slug' => $newSlug, ':id' => $r['id']]);
            echo "  Fixed id={$r['id']} name='{$r['name']}' -> slug={$newSlug}\n";
        }
    } else {
        echo "  (no NULL slugs - nothing to fix)\n";
    }
} catch (Exception $e) {
    echo "  ERROR: " . $e->getMessage() . "\n";
}

// 2. Check & create Notification table
echo "\n=== Step 2: Ensure Notification table ===\n";
try {
    $exists = (int) $pdo->query("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name='Notification'")->fetchColumn();
    if (!$exists) {
        echo "Table Notification missing — creating...\n";
        $pdo->exec("CREATE TABLE `Notification` (
            `id` VARCHAR(191) NOT NULL,
            `userId` VARCHAR(191) NULL,
            `role` VARCHAR(191) NULL,
            `title` VARCHAR(191) NOT NULL,
            `message` TEXT NOT NULL,
            `type` VARCHAR(191) NOT NULL,
            `link` VARCHAR(191) NULL,
            `isRead` BOOLEAN NOT NULL DEFAULT false,
            `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
            PRIMARY KEY (`id`),
            INDEX `Notification_userId_idx`(`userId`),
            INDEX `Notification_role_idx`(`role`),
            INDEX `Notification_createdAt_idx`(`createdAt`)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        echo "  ✅ Created Notification table\n";
    } else {
        echo "  ✅ Notification table already exists\n";
    }
} catch (Exception $e) {
    echo "  ERROR: " . $e->getMessage() . "\n";
}

// 3. Check & create CustomDesignRequest table
echo "\n=== Step 3: Ensure CustomDesignRequest table ===\n";
try {
    $exists = (int) $pdo->query("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name='CustomDesignRequest'")->fetchColumn();
    if (!$exists) {
        echo "Table CustomDesignRequest missing — creating...\n";
        $pdo->exec("CREATE TABLE `CustomDesignRequest` (
            `id` VARCHAR(191) NOT NULL,
            `vendorId` VARCHAR(191) NOT NULL,
            `description` TEXT NOT NULL,
            `requirements` JSON NULL,
            `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
            `adminNotes` TEXT NULL,
            `price` DOUBLE NOT NULL DEFAULT 0,
            `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
            `updatedAt` DATETIME(3) NOT NULL,
            PRIMARY KEY (`id`),
            INDEX `CustomDesignRequest_vendorId_idx`(`vendorId`),
            CONSTRAINT `CustomDesignRequest_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `Vendor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        echo "  ✅ Created CustomDesignRequest table\n";
    } else {
        echo "  ✅ CustomDesignRequest table already exists\n";
    }
} catch (Exception $e) {
    echo "  ERROR: " . $e->getMessage() . "\n";
}

// 4. Check & add `tier` column on Vendor
echo "\n=== Step 4: Ensure Vendor.tier column ===\n";
try {
    $hasCol = (int) $pdo->query("SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='Vendor' AND column_name='tier'")->fetchColumn();
    if (!$hasCol) {
        echo "Vendor.tier missing — adding...\n";
        $pdo->exec("ALTER TABLE `Vendor` ADD COLUMN `tier` ENUM('FREEMIUM','PREMIUM_BUILDER','CUSTOM_DESIGN') NOT NULL DEFAULT 'FREEMIUM'");
        echo "  ✅ Added Vendor.tier column\n";
    } else {
        echo "  ✅ Vendor.tier already exists\n";
    }
} catch (Exception $e) {
    echo "  ERROR: " . $e->getMessage() . "\n";
}

// 5. Verify SubscriptionPlan columns (slug, isTrial, canUploadProducts, etc.)
echo "\n=== Step 5: Verify SubscriptionPlan key columns ===\n";
$required_cols = [
    'slug' => "ALTER TABLE `SubscriptionPlan` ADD COLUMN `slug` VARCHAR(191) NOT NULL",
    'canUploadProducts' => "ALTER TABLE `SubscriptionPlan` ADD COLUMN `canUploadProducts` BOOLEAN NOT NULL DEFAULT false",
    'canUseBuilder' => "ALTER TABLE `SubscriptionPlan` ADD COLUMN `canUseBuilder` BOOLEAN NOT NULL DEFAULT false",
    'canCustomDesign' => "ALTER TABLE `SubscriptionPlan` ADD COLUMN `canCustomDesign` BOOLEAN NOT NULL DEFAULT false",
    'maxProducts' => "ALTER TABLE `SubscriptionPlan` ADD COLUMN `maxProducts` INT NOT NULL DEFAULT 0",
    'maxBlocks' => "ALTER TABLE `SubscriptionPlan` ADD COLUMN `maxBlocks` INT NOT NULL DEFAULT 0",
    'features' => "ALTER TABLE `SubscriptionPlan` ADD COLUMN `features` JSON NULL",
    'stripePriceId' => "ALTER TABLE `SubscriptionPlan` ADD COLUMN `stripePriceId` VARCHAR(191) NULL UNIQUE",
];
foreach ($required_cols as $col => $ddl) {
    try {
        $hasCol = (int) $pdo->query("SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='SubscriptionPlan' AND column_name='$col'")->fetchColumn();
        if (!$hasCol) {
            $pdo->exec($ddl);
            echo "  ✅ Added SubscriptionPlan.$col\n";
        } else {
            echo "  ✅ $col already exists\n";
        }
    } catch (Exception $e) {
        echo "  ERROR for $col: " . $e->getMessage() . "\n";
    }
}

// 6. Final check: slug should now be NOT NULL & UNIQUE
echo "\n=== Step 6: Ensure slug unique index ===\n";
try {
    $hasUnique = (int) $pdo->query("SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='SubscriptionPlan' AND column_name='slug' AND non_unique=0")->fetchColumn();
    if (!$hasUnique) {
        $pdo->exec("CREATE UNIQUE INDEX `SubscriptionPlan_slug_key` ON `SubscriptionPlan`(`slug`)");
        echo "  ✅ Added unique index on slug\n";
    } else {
        echo "  ✅ Unique index on slug already exists\n";
    }
} catch (Exception $e) {
    echo "  NOTE: " . $e->getMessage() . "\n";
}

// 7. Touch restart
echo "\n=== Step 7: Touch restart.txt ===\n";
$rp = '/home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt';
if (!is_dir(dirname($rp))) mkdir(dirname($rp), 0755, true);
touch($rp);
echo "  ✅ Touched restart.txt — app will restart in ~30s\n";

echo "\n=== ALL DONE ===\n";
