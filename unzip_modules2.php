<?php
// Unzip all node_modules packages into app_new
set_time_limit(300);
ini_set('max_execution_time', 300);

$app_new = '/home/u754458241/domains/morsall.com/public_html/app_new';
$public = '/home/u754458241/domains/morsall.com/public_html';

$zips = [
    $public . '/core_modules.zip',
    $public . '/next_at_modules.zip', 
    $public . '/remaining_modules.zip'
];

echo "<pre>";
echo "Target: $app_new/node_modules\n\n";

foreach ($zips as $zip) {
    if (!file_exists($zip)) {
        echo "MISSING: $zip\n";
        continue;
    }
    $size = round(filesize($zip) / 1024 / 1024, 1);
    echo "Extracting $zip ({$size}MB)...\n";
    flush();
    
    $za = new ZipArchive();
    if ($za->open($zip) === true) {
        $za->extractTo($app_new);
        $za->close();
        echo "  Done!\n";
    } else {
        echo "  FAILED to open zip\n";
    }
    flush();
}

// Check result
if (is_dir("$app_new/node_modules")) {
    echo "\n✅ node_modules EXISTS!\n";
    echo "Has 'next': " . (is_dir("$app_new/node_modules/next") ? "YES" : "NO") . "\n";
} else {
    echo "\n❌ node_modules NOT FOUND\n";
    // Try using shell_exec as fallback
    echo "Trying shell_exec...\n";
    $out = shell_exec("cd $app_new && unzip -n $public/core_modules.zip 2>&1 | tail -5");
    echo $out;
}
echo "</pre>";
?>
