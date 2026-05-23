<?php
echo "<pre>";
echo "Checking startup.js:\n";
$f = '/home/u754458241/domains/morsall.com/public_html/app_new/startup.js';
if (file_exists($f)) {
    echo "EXISTS: $f\n";
    echo "Permissions: " . substr(sprintf('%o', fileperms($f)), -4) . "\n";
} else {
    echo "MISSING: $f\n";
}
echo "</pre>";
?>
