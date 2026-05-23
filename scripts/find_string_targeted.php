<?php
function searchString($dirs, $str) {
    $results = [];
    foreach ($dirs as $dir) {
        if (!is_dir($dir)) continue;
        $it = new RecursiveDirectoryIterator($dir);
        foreach (new RecursiveIteratorIterator($it) as $file) {
            if ($file->isFile() && $file->getSize() < 1000000) {
                $pathname = $file->getPathname();
                // Skip next_build.zip or similar large files if they slipped in
                if (strpos($pathname, '.zip') !== false) continue;
                
                $content = file_get_contents($pathname);
                if (strpos($content, $str) !== false) {
                    $results[] = $pathname;
                }
            }
        }
    }
    return $results;
}

$dirs = [
    '/home/u754458241/nodeapp',
    '/home/u754458241/domains/morsall.com/public_html',
    '/home/u754458241/domains/morsall.com/app'
];
echo "Searching for 'HELLO FROM SIMPLE SERVER' in targeted dirs...\n";
$matches = searchString($dirs, 'HELLO FROM SIMPLE SERVER');
print_r($matches);
?>
