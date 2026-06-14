<?php
header('Content-Type: text/plain; charset=utf-8');
$secret = $_GET['v'] ?? '';
if ($secret !== 'check2026vixcell') {
    die('Access Denied');
}

$client_dir = '/home/u754458241/domains/morsall.com/nodejs/node_modules/.prisma/client';
$default_js = "$client_dir/default.js";

if (!file_exists($default_js)) die("default.js missing\n");

$content = file_get_contents($default_js);

// Look for engineType references
preg_match_all('/engineType["\s:=]+"?([a-z]+)"?/i', $content, $matches);
echo "=== engineType matches in default.js ===\n";
foreach ($matches[0] as $i => $m) {
    echo "  $m\n";
}

// File mtime
$mtime = date('Y-m-d H:i:s', filemtime($default_js));
echo "\ndefault.js mtime: $mtime\n";
echo "default.js size: " . filesize($default_js) . " bytes\n";

// Check schema.prisma in nodejs
$schema = '/home/u754458241/domains/morsall.com/nodejs/prisma/schema.prisma';
if (file_exists($schema)) {
    $sc = file_get_contents($schema);
    if (preg_match('/engineType\s*=\s*"([a-z]+)"/', $sc, $m)) {
        echo "\nschema.prisma engineType = \"$m[1]\"\n";
    } else {
        echo "\nschema.prisma has NO engineType set\n";
    }
}

// Check .env
$env = '/home/u754458241/domains/morsall.com/nodejs/.env';
if (file_exists($env)) {
    $env_content = file_get_contents($env);
    if (preg_match('/PRISMA_CLIENT_ENGINE_TYPE\s*=\s*(\S+)/', $env_content, $m)) {
        echo ".env PRISMA_CLIENT_ENGINE_TYPE = $m[1]\n";
    } else {
        echo ".env has NO PRISMA_CLIENT_ENGINE_TYPE\n";
    }
}

// List binary engines
echo "\n=== Binary engines available ===\n";
foreach (glob("$client_dir/query-engine-*") as $f) {
    if (strpos($f, '.tmp') !== false || strpos($f, 'windows') !== false) continue;
    printf("  %s (%.1f MB)\n", basename($f), filesize($f) / 1024 / 1024);
}

echo "\n=== Library engines (.so.node) available ===\n";
foreach (glob("$client_dir/libquery_engine-*") as $f) {
    printf("  %s (%.1f MB)\n", basename($f), filesize($f) / 1024 / 1024);
}

echo "\nDone\n";
