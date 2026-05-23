<?php
$out = "=== DIAG INFO ===\n";
$out .= "getcwd(): " . getcwd() . "\n";
$out .= "realpath('.'): " . realpath('.') . "\n";
$out .= "PHP version: " . phpversion() . "\n";
$out .= "app_new exists: " . (is_dir('app_new') ? "YES" : "NO") . "\n";
$out .= "app_new/app.js exists: " . (file_exists('app_new/app.js') ? "YES" : "NO") . "\n";
$out .= "app_new/.next exists: " . (is_dir('app_new/.next') ? "YES" : "NO") . "\n";

file_put_contents('diag_output.txt', $out);
echo "DIAG_OK";
?>
