<?php
$src = '/home/u754458241/domains/morsall.com/public_html/app_new/node_modules';
$dest = '/home/u754458241/nodeapp/node_modules';

echo "<pre>";
echo "Testing writability of /home/u754458241/nodeapp: " . (is_writable('/home/u754458241/nodeapp') ? "YES" : "NO") . "\n";
echo "Attempting symlink again with error reporting...\n";
error_reporting(E_ALL);
ini_set('display_errors', 1);

if (symlink($src, $dest)) {
    echo "SUCCESS!\n";
} else {
    echo "FAILED!\n";
    $err = error_get_last();
    print_r($err);
}
echo "</pre>";
?>
