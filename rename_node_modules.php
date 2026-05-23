<?php
$src = '/home/u754458241/domains/morsall.com/public_html/app_new/node_modules';
$dest = '/home/u754458241/nodeapp/node_modules';

echo "<pre>";
if (!is_dir($src)) {
    echo "SOURCE MISSING: $src\n";
} else {
    echo "Attempting to RENAME (MOVE) $src to $dest...\n";
    if (rename($src, $dest)) {
        echo "SUCCESS! node_modules moved to nodeapp.\n";
    } else {
        echo "FAILED to move node_modules.\n";
        $err = error_get_last();
        print_r($err);
    }
}
echo "</pre>";
?>
