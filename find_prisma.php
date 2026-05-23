<?php
echo "<pre>";
function listAll($dir) {
    $files = scandir($dir);
    foreach($files as $f) {
        if ($f == '.' || $f == '..') continue;
        $path = $dir . '/' . $f;
        echo $path . "\n";
        if (is_dir($path) && (strpos($path, 'node_modules') !== false || strpos($path, '.prisma') !== false)) {
             // Only recurse into relevant folders to save output
             listAll($path);
        }
    }
}
listAll('/home/u754458241/domains/morsall.com/nodejs');
echo "</pre>";
?>
