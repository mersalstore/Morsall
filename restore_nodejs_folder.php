<?php
$root = '/home/u754458241/domains/morsall.com/';
$prod = $root . 'production';
$node = $root . 'nodejs';

if (is_dir($node)) {
    // Delete empty nodejs if it's there
    rmdir($node);
}

if (rename($prod, $node)) {
    echo "Successfully moved back to nodejs folder.";
} else {
    echo "Failed to move production to nodejs.";
}
?>
