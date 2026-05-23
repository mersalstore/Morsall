<?php
$root = '/home/u754458241/domains/morsall.com/';
// Delete empty nodejs if exists
if (is_dir($root . 'nodejs')) {
    rmdir($root . 'nodejs');
}

// Find latest backup
$dirs = scandir($root);
$latest = '';
foreach ($dirs as $d) {
    if (strpos($d, 'nodejs_delete_') === 0) {
        if ($d > $latest) $latest = $d;
    }
}

if ($latest) {
    rename($root . $latest, $root . 'nodejs');
    echo "Restored $latest to nodejs";
} else {
    echo "No backup found to restore!";
}
?>
