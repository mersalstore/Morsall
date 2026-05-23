<?php
$old = '/home/u754458241/domains/morsall.com/nodejs';
$new = '/home/u754458241/domains/morsall.com/nodejs_backup_' . time();

if (rename($old, $new)) {
    echo "Successfully renamed $old to $new";
} else {
    echo "Failed to rename $old. Check permissions.";
}
?>
