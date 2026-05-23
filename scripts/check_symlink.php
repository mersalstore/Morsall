<?php
$target = '/home/u754458241/nodeapp/start_morsall.js';
if (is_link($target)) {
    echo "$target is a symlink to: " . readlink($target);
} else {
    echo "$target is NOT a symlink";
}
?>
