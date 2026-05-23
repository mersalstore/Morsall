<?php
$dir = '/home/u754458241/domains/morsall.com/public_html/app_new/node_modules/prisma/prisma-client/generator-build';
echo "<pre>";
if (is_dir($dir)) {
    echo "Contents of $dir:\n";
    $items = scandir($dir);
    foreach ($items as $item) {
        echo "[ " . (is_dir($dir . '/' . $item) ? "D" : "F") . " ] $item\n";
    }
} else {
    echo "Directory NOT FOUND at $dir\n";
}
echo "</pre>";
?>
