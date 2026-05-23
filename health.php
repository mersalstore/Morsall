<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
echo "<h1>System Health Report</h1>";
echo "<pre>";

$root = '/home/u754458241/domains/morsall.com/';
$node_root = $root . 'nodejs/';
$modules = $node_root . 'node_modules/';

// 1. Check Directories
echo "Checking Directories:\n";
$dirs = [
    'root' => $root,
    'nodejs' => $node_root,
    'node_modules' => $modules,
    'prisma_client' => $modules . '.prisma/client/',
    'swc_fallback' => $modules . 'next/next-swc-fallback/',
    'swc_gnu_pkg' => $modules . '@next/swc-linux-x64-gnu/',
    'swc_musl_pkg' => $modules . '@next/swc-linux-x64-musl/'
];

foreach ($dirs as $name => $path) {
    echo " - $name ($path): " . (is_dir($path) ? "✅ EXISTS" : "❌ MISSING") . "\n";
}

// 2. Check Key Files
echo "\nChecking Key Files:\n";
$files = [
    'server-hostinger.js' => $node_root . 'server-hostinger.js',
    '.env' => $node_root . '.env',
    'prisma_binary' => $dirs['prisma_client'] . 'query-engine-rhel-openssl-3.0.x',
    'swc_linux_gnu' => $dirs['swc_fallback'] . 'next-swc.linux-x64-gnu.node',
    'swc_linux_musl' => $dirs['swc_fallback'] . 'next-swc.linux-x64-musl.node',
    'swc_gnu_in_pkg' => $dirs['swc_gnu_pkg'] . 'next-swc.linux-x64-gnu.node',
    'swc_musl_in_pkg' => $dirs['swc_musl_pkg'] . 'next-swc.linux-x64-musl.node'
];

foreach ($files as $name => $path) {
    if (file_exists($path)) {
        echo " - $name: ✅ EXISTS (" . filesize($path) . " bytes)\n";
        if (strpos($path, 'query-engine') !== false) {
             echo "   Perms: " . substr(sprintf('%o', fileperms($path)), -4) . "\n";
        }
    } else {
        echo " - $name: ❌ MISSING\n";
    }
}

// 3. Inspect server-hostinger.js for engine force
if (file_exists($files['server-hostinger.js'])) {
    $content = file_get_contents($files['server-hostinger.js']);
    echo "\nServer Script Check:\n";
    echo " - PRISMA_CLIENT_ENGINE_TYPE force: " . (strpos($content, "PRISMA_CLIENT_ENGINE_TYPE = 'binary'") !== false ? "✅ FOUND" : "❌ NOT FOUND") . "\n";
}

// 4. Node Modules size
echo "\nCalculating node_modules size (can take time)...\n";
$size = 0;
foreach(new RecursiveIteratorIterator(new RecursiveDirectoryIterator($modules)) as $file){
    $size += $file->getSize();
}
echo " - node_modules Total Size: " . round($size / (1024 * 1024), 2) . " MB\n";

echo "</pre>";
?>
