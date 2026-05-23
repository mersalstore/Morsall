<?php
function find_file($dir, $filename) {
    $it = new RecursiveDirectoryIterator($dir);
    foreach (new RecursiveIteratorIterator($it) as $file) {
        if ($file->getFilename() == $filename) {
            echo $file->getPathname() . "\n";
        }
    }
}
echo "<pre>";
find_file('/home/u754458241', 'server.js');
echo "</pre>";
?>
