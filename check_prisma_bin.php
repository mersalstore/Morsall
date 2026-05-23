<?php
$bin = '/home/u754458241/domains/morsall.com/public_html/app_new/node_modules/.bin/prisma';
if (file_exists($bin)) {
    echo "Prisma bin found.\n";
    echo "Is link: " . (is_link($bin) ? "YES" : "NO") . "\n";
    echo "Target: " . readlink($bin) . "\n";
} else {
    echo "Prisma bin NOT FOUND at $bin";
}
?>
