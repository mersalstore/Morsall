<?php
$clientDir = '/home/u754458241/domains/morsall.com/public_html/app_new/node_modules/.prisma/client';
if (is_dir($clientDir)) {
    echo "Prisma client directory found.\n";
    $items = scandir($clientDir);
    foreach ($items as $item) {
        if (strpos($item, 'query-engine') !== false) {
            $full = $clientDir . '/' . $item;
            chmod($full, 0755);
            echo "Set 0755 permissions for binary: $item\n";
        }
    }
} else {
    echo "Prisma client directory NOT FOUND.\n";
}
?>
