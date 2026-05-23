<?php
$file = '/home/u754458241/nodeapp/app.js';
echo "Perms for $file: " . substr(sprintf('%o', fileperms($file)), -4) . "\n";
echo "Owner: " . fileowner($file) . "\n";
// Try to make it executable
chmod($file, 0755);
echo "New Perms: " . substr(sprintf('%o', fileperms($file)), -4) . "\n";
?>
