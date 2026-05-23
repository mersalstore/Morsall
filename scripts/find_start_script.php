<?php
function findFiles($dir, $filename) {
    $results = [];
    $it = new RecursiveDirectoryIterator($dir);
    foreach (new RecursiveIteratorIterator($it) as $file) {
        if ($file->getFilename() == $filename) {
            $results[] = $file->getPathname();
        }
    }
    return $results;
}

$home = '/home/u754458241';
echo "Searching for start_morsall.js in $home...\n";
$matches = findFiles($home, 'start_morsall.js');
print_r($matches);
?>
