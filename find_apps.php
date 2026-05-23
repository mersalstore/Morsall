<?php
echo "<pre>";
function findFiles($dir, $patterns) {
    $it = new RecursiveDirectoryIterator($dir);
    foreach (new RecursiveIteratorIterator($it) as $file) {
        foreach ($patterns as $p) {
            if (fnmatch($p, $file->getFilename())) {
                echo $file->getPathname() . " (Size: " . $file->getSize() . ")\n";
            }
        }
    }
}

findFiles('/home/u754458241/domains/morsall.com/', ['app.js', 'index.js', 'server.js']);
echo "</pre>";
?>
