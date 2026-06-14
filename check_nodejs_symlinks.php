<?php
header('Content-Type: text/plain; charset=utf-8');

echo "=== Nodejs Symlink Diagnostics ===\n";

$dir = '/home/u754458241/domains/morsall.com/nodejs';
$items = ['node_modules', '.next', 'server.js', 'package.json'];

foreach ($items as $item) {
    $path = "$dir/$item";
    echo "\nChecking: $path\n";
    if (file_exists($path)) {
        echo "  Exists: Yes\n";
        echo "  Is Dir: " . (is_dir($path) ? 'Yes' : 'No') . "\n";
        echo "  Is Link: " . (is_link($path) ? 'Yes' : 'No') . "\n";
        if (is_link($path)) {
            echo "  Target: " . readlink($path) . "\n";
        }
    } else {
        echo "  Exists: No\n";
    }
}
?>
