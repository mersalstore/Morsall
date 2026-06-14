<?php
header('Content-Type: text/plain; charset=utf-8');

echo "=== Nodeapp File Modification Times ===\n";

$dir = '/home/u754458241/nodeapp';
$files = ['server.js', 'stderr.log', 'server.log', '.next', 'tmp/restart.txt'];

foreach ($files as $f) {
    $path = "$dir/$f";
    if (file_exists($path)) {
        echo "$f:\n";
        echo "  Mtime: " . date('Y-m-d H:i:s', filemtime($path)) . "\n";
        echo "  Size: " . filesize($path) . " bytes\n";
    } else {
        echo "$f does not exist!\n";
    }
}
?>
