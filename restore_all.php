<?php
$backup = '/home/u754458241/domains/morsall.com/nodejs_backup_1778489634';
$target = '/home/u754458241/domains/morsall.com/nodejs';

$files = scandir($backup);
foreach($files as $f) {
    if ($f == '.' || $f == '..' || $f == 'node_modules') continue;
    $oldPath = $backup . '/' . $f;
    $newPath = $target . '/' . $f;
    if (rename($oldPath, $newPath)) {
        echo "Moved $f\n";
    } else {
        echo "Failed to move $f\n";
    }
}
?>
