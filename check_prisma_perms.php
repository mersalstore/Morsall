<?php
$prismaDir = '/home/u754458241/domains/morsall.com/public_html/app_new/node_modules/prisma';
echo "<pre>";
if (is_dir($prismaDir)) {
    echo "Prisma directory exists.\n";
    echo "Permissions: " . substr(sprintf('%o', fileperms($prismaDir)), -4) . "\n";
    $items = scandir($prismaDir);
    foreach ($items as $item) {
        $full = $prismaDir . '/' . $item;
        echo "[ " . (is_dir($full) ? "D" : "F") . " ] $item (" . substr(sprintf('%o', fileperms($full)), -4) . ")\n";
    }
} else {
    echo "Prisma directory NOT FOUND at $prismaDir\n";
}
echo "</pre>";
?>
