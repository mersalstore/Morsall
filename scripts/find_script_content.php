<?php
function searchCode($dir) {
    $results = [];
    $it = new RecursiveDirectoryIterator($dir);
    foreach (new RecursiveIteratorIterator($it) as $file) {
        if ($file->isFile() && $file->getSize() < 5000) { // Simple server is small
            $content = file_get_contents($file->getPathname());
            if (strpos($content, 'HELLO FROM SIMPLE SERVER') !== false) {
                $results[] = $file->getPathname();
            }
        }
    }
    return $results;
}

$home = '/home/u754458241';
echo "Searching for the script content in $home...\n";
$matches = searchCode($home);
print_r($matches);
?>
