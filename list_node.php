<?php
echo "<pre>";
$path = '/home/u754458241/domains/morsall.com/nodejs';
if (is_dir($path)) {
    echo "Contents of $path:\n";
    print_r(scandir($path));
} else {
    echo "$path is NOT a directory\n";
}
echo "</pre>";
?>
