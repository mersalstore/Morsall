<?php
echo "<pre>";
function getDirSize($path) {
    if (!is_dir($path)) return -1;
    $size = 0;
    foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($path)) as $file) {
        $size += $file->getSize();
    }
    return $size;
}

$base = '/home/u754458241/domains/morsall.com/nodejs/node_modules/';
$modules = ['next', 'dotenv', 'react', 'react-dom', 'next-auth', '@prisma/client'];

echo "--- CORE MODULES SIZES ---\n";
foreach ($modules as $m) {
    $size = getDirSize($base . $m);
    if ($size === -1) {
        echo "❌ $m NOT FOUND\n";
    } else {
        echo "✅ $m: " . round($size / 1024 / 1024, 2) . " MB\n";
        if ($m == 'next') {
             echo "Checking next/package.json: " . (file_exists($base . 'next/package.json') ? "✅ YES" : "❌ NO") . "\n";
        }
    }
}

echo "\n--- APP LOG (my_app_log.txt) ---\n";
$appLog = '/home/u754458241/domains/morsall.com/nodejs/my_app_log.txt';
if (file_exists($appLog)) echo file_get_contents($appLog);

echo "\n--- ERROR LOG (stderr.log) ---\n";
$errLog = '/home/u754458241/domains/morsall.com/nodejs/stderr.log';
if (file_exists($errLog)) echo file_get_contents($errLog);

echo "</pre>";
?>
