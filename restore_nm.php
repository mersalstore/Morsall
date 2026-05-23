<?php
$backup = '/home/u754458241/domains/morsall.com/nodejs_backup_1778489634/node_modules';
$target = '/home/u754458241/domains/morsall.com/nodejs/node_modules';

if (rename($backup, $target)) {
    echo "Successfully moved node_modules to new nodejs folder";
} else {
    echo "Failed to move node_modules. Check permissions.";
}
?>
