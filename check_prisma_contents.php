<?php
$prismaDir = '/home/u754458241/domains/morsall.com/public_html/app_new/node_modules/prisma';
if (is_dir($prismaDir)) {
    echo "<pre>Contents of $prismaDir:\n";
    $items = scandir($prismaDir);
    foreach ($items as $item) {
        echo $item . (is_dir($prismaDir . '/' . $item) ? ' [D]' : '') . "\n";
    }
    
    if (is_dir($prismaDir . '/build')) {
        echo "\nContents of $prismaDir/build:\n";
        $items = scandir($prismaDir . '/build');
        foreach ($items as $item) {
            echo $item . "\n";
        }
    }
    echo "</pre>";
} else {
    echo "Prisma directory NOT FOUND at $prismaDir";
}
?>
