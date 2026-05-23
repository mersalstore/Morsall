<?php
$root = '/home/u754458241/domains/morsall.com/';
$old = $root . 'nodejs';
$new = $root . 'production';

if (!is_dir($new)) {
    mkdir($new, 0777);
}

// Function to copy folder recursively
function recurse_copy($src,$dst) {
    $dir = opendir($src);
    @mkdir($dst);
    while(false !== ( $file = readdir($dir)) ) {
        if (( $file != '.' ) && ( $file != '..' )) {
            if ( is_dir($src . '/' . $file) ) {
                recurse_copy($src . '/' . $file,$dst . '/' . $file);
            }
            else {
                copy($src . '/' . $file,$dst . '/' . $file);
            }
        }
    }
    closedir($dir);
}

// Instead of copying 30k files, let's just RENAME the folder if it's not nodejs
// But nodejs is likely locked.
// I'll try to RENAME nodejs to production.
if (rename($old, $new)) {
    echo "Successfully moved nodejs to production folder.";
} else {
    echo "Failed to rename nodejs. Maybe it is locked by Passenger. Attempting to copy essential files...";
    // Just copy entry files
    copy($old . '/server.js', $new . '/server.js');
    copy($old . '/package.json', $new . '/package.json');
    copy($old . '/.env', $new . '/.env');
    // Symlink the rest
    symlink($old . '/node_modules', $new . '/node_modules');
    symlink($old . '/.next', $new . '/.next');
    symlink($old . '/public', $new . '/public');
    echo "Symlinked essential folders to production.";
}
?>
