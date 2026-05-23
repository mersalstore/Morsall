<?php
$dir = '/home/u754458241/domains/morsall.com';
echo "Searching in $dir...<br>";

function search($path, $file) {
    if (!is_dir($path)) return;
    $files = scandir($path);
    foreach ($files as $f) {
        if ($f == '.' || $f == '..') continue;
        $full = $path . '/' . $f;
        if (is_dir($full)) {
            // search($full, $file); // avoid deep recursion
        } else {
            if ($f == $file) {
                echo "Found at: " . $full . "<br>";
            }
        }
    }
}

search($dir, 'fixes.zip');
search($dir . '/public_html', 'fixes.zip');
search($dir . '/nodejs', 'fixes.zip');
search($dir . '/app_new', 'fixes.zip');
echo "Done.";
?>
