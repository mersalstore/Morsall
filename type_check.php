<?php
echo "<pre>";
$dir = '/home/u754458241/domains/morsall.com/';
$files = scandir($dir);
foreach($files as $f) {
    if ($f == '.' || $f == '..') continue;
    $path = $dir . $f;
    $isDir = is_dir($path) ? 'DIR' : 'FILE';
    $isLink = is_link($path) ? 'LINK' : 'NOT LINK';
    echo "[$isDir] [$isLink] $f\n";
    if ($f == 'nodejs') {
        echo "   Target: " . readlink($path) . "\n";
    }
}
echo "</pre>";
?>
