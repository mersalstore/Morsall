<?php
$root = '/home/u754458241/domains/morsall.com/';
$old = $root . 'nodejs';
$new = $root . 'app_new';

if (rename($old, $new)) {
    echo "Successfully moved nodejs to app_new.";
} else {
    echo "Failed to move.";
}
?>
