<?php
set_time_limit(300);
ini_set('max_execution_time', 300);
ini_set('memory_limit', '512M');

$base    = '/home/u754458241/domains/morsall.com/public_html';
$app_new = "$base/app_new";
$nm      = "$app_new/node_modules";
$progress_file = "$base/extract_progress.txt";

header('Content-Type: text/plain');
header('X-Accel-Buffering: no');
ob_implicit_flush(true);

echo "=== EXTRACT PROGRESS ===\n\n";

// Check already done
if (is_dir("$nm/next")) {
    echo "✅ node_modules/next ALREADY EXISTS!\n";
    exit;
}

// Create node_modules dir
if (!is_dir($nm)) {
    mkdir($nm, 0755, true);
}

// Get which step we're on
$step = 0;
if (file_exists($progress_file)) {
    $step = (int) file_get_contents($progress_file);
}

$zips = [
    0 => "$base/core_modules.zip",
    1 => "$base/next_at_modules.zip",
    2 => "$base/remaining_modules.zip",
];

echo "Starting from step: $step\n\n";

if (!isset($zips[$step])) {
    echo "✅ ALL DONE!\n";
    echo "node_modules exists: " . (is_dir($nm) ? "YES" : "NO") . "\n";
    echo "next exists: " . (is_dir("$nm/next") ? "YES" : "NO") . "\n";
    exit;
}

$zip_file = $zips[$step];
echo "Extracting: $zip_file\n";
echo "Size: " . round(filesize($zip_file)/1024/1024, 1) . "MB\n\n";

$za = new ZipArchive();
if ($za->open($zip_file) === true) {
    echo "Opened ZIP OK. Files: " . $za->numFiles . "\n";
    flush();
    
    $extracted = 0;
    for ($i = 0; $i < $za->numFiles; $i++) {
        $name = $za->getNameIndex($i);
        $dest = "$app_new/$name";
        
        if (substr($name, -1) === '/') {
            if (!is_dir($dest)) mkdir($dest, 0755, true);
        } else {
            $dir = dirname($dest);
            if (!is_dir($dir)) mkdir($dir, 0755, true);
            file_put_contents($dest, $za->getFromIndex($i));
            $extracted++;
        }
        
        if ($i % 1000 === 0) {
            echo "Progress: $i/" . $za->numFiles . " files\n";
            flush();
        }
    }
    $za->close();
    
    // Save progress
    file_put_contents($progress_file, $step + 1);
    echo "\n✅ Done! Extracted $extracted files from step $step\n";
    echo "Refresh this page to continue with next zip.\n";
    echo "\nnext exists: " . (is_dir("$nm/next") ? "YES" : "NO") . "\n";
} else {
    echo "❌ Failed to open: $zip_file\n";
}
?>
