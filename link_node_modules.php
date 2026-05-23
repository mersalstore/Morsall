<?php
$src = '/home/u754458241/domains/morsall.com/public_html/app_new/node_modules';
$dest = '/home/u754458241/nodeapp/node_modules';

echo "<pre>";
if (file_exists($dest)) {
    echo "node_modules already exists in dest. Removing...\n";
    @unlink($dest);
}

echo "Creating symlink from $src to $dest...\n";
if (symlink($src, $dest)) {
    echo "Symlink created successfully.\n";
} else {
    echo "FAILED to create symlink.\n";
}
echo "</pre>";
?>
