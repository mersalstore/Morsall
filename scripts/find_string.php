<?php
function searchString($dir, $str) {
    $results = [];
    $it = new RecursiveDirectoryIterator($dir);
    foreach (new RecursiveIteratorIterator($it) as $file) {
        if ($file->isFile() && $file->getSize() < 1000000) { // Limit size
            $content = file_get_contents($file->getPathname());
            if (strpos($content, $str) !== false) {
                $results[] = $file->getPathname();
            }
        }
    }
    return $results;
}

$home = '/home/u754458241';
echo "Searching for 'HELLO FROM SIMPLE SERVER' in $home...\n";
$matches = searchString($home, 'HELLO FROM SIMPLE SERVER');
print_r($matches);
?>
