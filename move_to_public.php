<?php
$root = '/home/u754458241/domains/morsall.com/';
$src = $root . 'app_new';
$dst = $root . 'public_html/app_new';

if (rename($src, $dst)) {
    echo "Successfully moved app_new to public_html/app_new.";
} else {
    echo "Failed to move.";
}
?>
