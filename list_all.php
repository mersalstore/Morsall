<?php
function list_dirs($path, $depth = 0) {
    if ($depth > 2) return;
    $items = scandir($path);
    foreach ($items as $item) {
        if ($item == '.' || $item == '..') continue;
        $full = $path . '/' . $item;
        echo str_repeat('  ', $depth) . (is_dir($full) ? '[D] ' : '[F] ') . $item . "\n";
        if (is_dir($full)) {
            list_dirs($full, $depth + 1);
        }
    }
}

echo "<pre>";
list_dirs('/home/u754458241');
echo "</pre>";
?>
