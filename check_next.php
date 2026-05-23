<?php
$nm = '/home/u754458241/domains/morsall.com/nodejs/node_modules/next';
if (is_dir($nm)) {
    echo "Next.js package FOUND in node_modules.";
} else {
    echo "Next.js package MISSING in node_modules!";
    // Check parent
    $parent = dirname($nm);
    if (is_dir($parent)) {
        echo " Parent node_modules EXISTS. Listing first 10 items:\n";
        $items = array_slice(scandir($parent), 0, 10);
        print_r($items);
    }
}
?>
