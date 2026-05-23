<?php
$node = '/opt/alt/alt-nodejs22/root/usr/bin/node';
$cmd = "$node -v 2>&1";
echo "<pre>";
echo "Running: $cmd\n";
echo shell_exec($cmd);
echo "\n--- Path check ---\n";
echo "Current dir: " . getcwd() . "\n";
echo "app_new exists: " . (is_dir('/home/u754458241/domains/morsall.com/public_html/app_new') ? "YES" : "NO") . "\n";
echo "</pre>";
?>
