<?php
echo "PHP OK\n";
$base = '/home/u754458241/domains/morsall.com/public_html';
echo "app_new exists: " . (is_dir("$base/app_new") ? "YES" : "NO") . "\n";
echo "node_modules: " . (is_dir("$base/app_new/node_modules") ? "YES" : "NO") . "\n";
echo "next: " . (is_dir("$base/app_new/node_modules/next") ? "YES" : "NO") . "\n";
echo "core_modules.zip: " . (file_exists("$base/core_modules.zip") ? filesize("$base/core_modules.zip") . " bytes" : "MISSING") . "\n";
echo "shell_exec: ";
$t = shell_exec("echo test 2>&1");
echo ($t === null ? "DISABLED" : "OK: $t") . "\n";
echo "exec: ";
$o = []; exec("echo test2 2>&1", $o);
echo (empty($o) ? "DISABLED" : "OK: " . implode('', $o)) . "\n";
?>
