<?php
header('Content-Type: text/plain; charset=utf-8');
$secret = $_GET['v'] ?? '';
if ($secret !== 'fix2026vixcell') {
    die('Access Denied');
}

$envFile = '/home/u754458241/domains/morsall.com/nodejs/.env';
if (!file_exists($envFile)) die("env not found: $envFile");

$content = file_get_contents($envFile);
echo "=== Current .env stats ===\n";
echo "Length: " . strlen($content) . " bytes\n";
echo "Has PRISMA_CLIENT_ENGINE_TYPE: " . (strpos($content, 'PRISMA_CLIENT_ENGINE_TYPE') !== false ? 'YES' : 'NO') . "\n";

// Add or replace PRISMA_CLIENT_ENGINE_TYPE
if (preg_match('/^PRISMA_CLIENT_ENGINE_TYPE\s*=.*$/m', $content)) {
    $newContent = preg_replace('/^PRISMA_CLIENT_ENGINE_TYPE\s*=.*$/m', 'PRISMA_CLIENT_ENGINE_TYPE=binary', $content);
    echo "Replacing existing PRISMA_CLIENT_ENGINE_TYPE line\n";
} else {
    // Append at end with newline
    $newContent = rtrim($content, "\n") . "\nPRISMA_CLIENT_ENGINE_TYPE=binary\n";
    echo "Appending PRISMA_CLIENT_ENGINE_TYPE=binary\n";
}

// Backup first
$backup = $envFile . '.bak.' . date('YmdHis');
copy($envFile, $backup);
echo "Backup saved: $backup\n";

// Write new content
if (file_put_contents($envFile, $newContent) === false) {
    die("Failed to write .env\n");
}
echo "✅ Wrote new .env with PRISMA_CLIENT_ENGINE_TYPE=binary\n";

// Verify
$verify = file_get_contents($envFile);
preg_match('/^PRISMA_CLIENT_ENGINE_TYPE\s*=\s*(\S+)/m', $verify, $m);
echo "Verify: PRISMA_CLIENT_ENGINE_TYPE=" . ($m[1] ?? 'MISSING') . "\n";

// Verify binary engines exist
$enginesDir = '/home/u754458241/domains/morsall.com/nodejs/node_modules/.prisma/client';
echo "\n=== Binary engines available ===\n";
foreach (glob("$enginesDir/query-engine-*") as $f) {
    echo "  " . basename($f) . " (" . filesize($f) . " bytes)\n";
}

// Touch restart
$rp = '/home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt';
if (!is_dir(dirname($rp))) mkdir(dirname($rp), 0755, true);
touch($rp);
echo "\n✅ Touched restart.txt — app will restart\n";
echo "DONE\n";
