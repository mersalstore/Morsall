<?php
$root = '/home/u754458241/domains/morsall.com/';
// Find the latest nodejs_delete folder
$dirs = scandir($root);
$latest = '';
foreach ($dirs as $d) {
    if (strpos($d, 'nodejs_delete_') === 0) {
        if ($d > $latest) $latest = $d;
    }
}

if ($latest) {
    symlink($root . $latest . '/node_modules', $root . 'app/node_modules');
    symlink($root . $latest . '/.next', $root . 'app/.next');
    symlink($root . $latest . '/public', $root . 'app/public');
    echo "Symlinked node_modules, .next, and public from $latest to /app";
} else {
    echo "No nodejs_delete folder found!";
}
?>
