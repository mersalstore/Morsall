<?php
$dest = '/home/u754458241/nodeapp/node_modules';
echo "<pre>";
if (file_exists($dest)) {
    echo "EXISTS: $dest\n";
    if (is_link($dest)) {
        echo "It is a SYMLINK pointing to: " . readlink($dest) . "\n";
    } else {
        echo "It is NOT a symlink.\n";
    }
} else {
    echo "MISSING: $dest\n";
}
echo "</pre>";
?>
