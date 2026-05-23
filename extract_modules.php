<?php
set_time_limit(600);
ini_set('max_execution_time', 600);
ini_set('memory_limit', '512M');

$app_new = '/home/u754458241/domains/morsall.com/public_html/app_new';
$public  = '/home/u754458241/domains/morsall.com/public_html';

echo "<pre>\n";

// First check if node_modules already exists
if (is_dir("$app_new/node_modules/next")) {
    echo "✅ node_modules/next ALREADY EXISTS - nothing to do!\n";
    exit;
}

// Try shell_exec first (fastest)
$cmds = [
    "cd $app_new && unzip -n $public/core_modules.zip 2>&1 | tail -3",
    "cd $app_new && unzip -n $public/next_at_modules.zip 2>&1 | tail -3",
    "cd $app_new && unzip -n $public/remaining_modules.zip 2>&1 | tail -3",
];

$shell_ok = false;
foreach ($cmds as $cmd) {
    echo "Running: $cmd\n";
    $out = shell_exec($cmd);
    if ($out !== null) {
        echo $out . "\n";
        $shell_ok = true;
    } else {
        echo "shell_exec returned null\n";
    }
    flush();
}

if (!$shell_ok) {
    echo "shell_exec disabled, trying ZipArchive...\n";
    
    $zips = [
        $public . '/core_modules.zip',
        $public . '/next_at_modules.zip', 
        $public . '/remaining_modules.zip'
    ];
    
    foreach ($zips as $zip) {
        if (!file_exists($zip)) {
            echo "MISSING: $zip\n";
            continue;
        }
        $size = round(filesize($zip) / 1024 / 1024, 1);
        echo "Extracting: $zip ({$size}MB)...\n";
        flush();
        
        $za = new ZipArchive();
        $res = $za->open($zip);
        if ($res === true) {
            $za->extractTo($app_new);
            $za->close();
            echo "  ✅ Done\n";
        } else {
            echo "  ❌ Failed: error code $res\n";
        }
        flush();
    }
}

// Final check
echo "\n--- RESULT ---\n";
echo "node_modules exists: " . (is_dir("$app_new/node_modules") ? "YES" : "NO") . "\n";
echo "next exists: " . (is_dir("$app_new/node_modules/next") ? "YES" : "NO") . "\n";
echo "@prisma exists: " . (is_dir("$app_new/node_modules/@prisma") ? "YES" : "NO") . "\n";
echo "</pre>\n";
?>
