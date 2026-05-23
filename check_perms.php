<?php
echo "getcwd(): " . getcwd() . "\n";
echo "realpath('.'): " . realpath('.') . "\n";
$dirs = [getcwd(), getcwd().'/app_new'];
    echo "$d: " . substr(sprintf('%o', fileperms($d)), -4) . " " . (is_readable($d) ? "READABLE" : "NOT READABLE") . "\n";
}
$files = ['/home/u754458241/domains/morsall.com/public_html/app_new/app.js'];
foreach ($files as $f) {
    echo "$f: " . substr(sprintf('%o', fileperms($f)), -4) . " " . (is_readable($f) ? "READABLE" : "NOT READABLE") . "\n";
}
?>
