<?php
$src = '/home/u754458241/nodeapp/node_modules';
$dest = '/home/u754458241/domains/morsall.com/public_html/node_modules';

echo "<pre>";
if (is_dir($src)) {
    echo "Moving node_modules back to public_html...\n";
    if (rename($src, $dest)) {
        echo "SUCCESS!\n";
    } else {
        echo "FAILED move.\n";
    }
} else {
    echo "Source missing: $src\n";
}
echo "</pre>";
?>
