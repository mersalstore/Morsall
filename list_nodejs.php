<?php
echo "<pre>";
$path = '/home/u754458241/domains/morsall.com/nodejs/';
echo "Listing $path:\n";
if (is_dir($path)) {
    print_r(scandir($path));
} else {
    echo "Directory not found";
}
echo "</pre>";
?>
