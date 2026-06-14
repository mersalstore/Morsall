<?php
header('Content-Type: text/plain; charset=utf-8');

echo "=== Safe Filesystem Diagnostics ===\n";
echo "Current script path: " . __FILE__ . "\n";
echo "Document root: " . $_SERVER['DOCUMENT_ROOT'] . "\n";

$home = '/home/u754458241';
echo "\n=== Home Directory ($home) contents ===\n";
if (is_dir($home)) {
    $files = scandir($home);
    if ($files === false) {
        echo "  Failed to scan $home\n";
    } else {
        foreach ($files as $file) {
            $path = "$home/$file";
            $type = is_link($path) ? 'LINK' : (is_dir($path) ? 'DIR' : 'FILE');
            echo "  $file ($type)\n";
        }
    }
} else {
    echo "  $home is not a directory!\n";
}

echo "\n=== Checking specific paths ===\n";
$paths_to_check = [
    '/home/u754458241/nodeapp',
    '/home/u754458241/domains/morsall.com/nodejs',
    '/home/u754458241/public_html',
];

foreach ($paths_to_check as $p) {
    echo "\nPath: $p\n";
    if (file_exists($p)) {
        echo "  Exists: Yes\n";
        echo "  Is Dir: " . (is_dir($p) ? 'Yes' : 'No') . "\n";
        echo "  Is Link: " . (is_link($p) ? 'Yes' : 'No') . "\n";
        if (is_dir($p)) {
            $contents = @scandir($p);
            if ($contents !== false) {
                echo "  Contents: " . implode(', ', array_diff($contents, ['.', '..'])) . "\n";
            } else {
                echo "  Contents: Failed to scan directory (permissions?)\n";
            }
        }
    } else {
        echo "  Exists: No\n";
    }
}
?>
