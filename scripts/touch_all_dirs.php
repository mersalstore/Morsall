<?php
$dirs = [
    '/home/u754458241/nodeapp/tmp',
    '/home/u754458241/domains/morsall.com/public_html/app_new/tmp',
    '/home/u754458241/domains/morsall.com/public_html/tmp',
    '/home/u754458241/domains/morsall.com/nodejs/tmp',
    '/home/u754458241/domains/morsall.com/app/tmp'
];

foreach ($dirs as $dir) {
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    $file = $dir . '/restart.txt';
    if (touch($file)) {
        echo "Touched $file\n";
    } else {
        echo "Failed to touch $file\n";
    }
}
?>
