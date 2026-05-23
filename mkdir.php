<?php
$path = '/home/u754458241/domains/morsall.com/nodejs';
if (mkdir($path, 0755)) {
    echo "Successfully created $path";
} else {
    echo "Failed to create $path";
}
?>
