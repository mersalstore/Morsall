<?php
header('Content-Type: text/plain');
$dir = '/home/u754458241/nodeapp';

echo "Nuking backslash-mangled entries in $dir...\n";

$items = scandir($dir);
foreach ($items as $item) {
    if (strpos($item, '\\') !== false) {
        $fullPath = $dir . '/' . $item;
        echo "Deleting: $item\n";
        // Use system rm to be sure
        shell_exec("rm -rf " . escapeshellarg($fullPath));
    }
}

echo "✅ Nuke complete!\n";
?>
