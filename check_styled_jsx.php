<?php
$file = '/home/u754458241/domains/morsall.com/public_html/app_new/node_modules/styled-jsx/package.json';
if (file_exists($file)) {
    echo "File exists.\n";
    echo "Permissions: " . substr(sprintf('%o', fileperms($file)), -4) . "\n";
    echo "Owner ID: " . fileowner($file) . "\n";
    echo "Group ID: " . filegroup($file) . "\n";
    echo "Readable: " . (is_readable($file) ? 'Yes' : 'No') . "\n";
} else {
    echo "File NOT FOUND.\n";
}
?>
