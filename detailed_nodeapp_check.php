<?php
header('Content-Type: text/plain; charset=utf-8');

echo "=== Detailed /home/u754458241/nodeapp Diagnostics ===\n";

$dir = '/home/u754458241/nodeapp';
if (is_dir($dir)) {
    $items = scandir($dir);
    echo "Items in $dir:\n";
    foreach ($items as $item) {
        if ($item === '.' || $item === '..') continue;
        $path = "$dir/$item";
        $is_link = is_link($path);
        $link_target = $is_link ? readlink($path) : '';
        $type = $is_link ? 'LINK' : (is_dir($path) ? 'DIR' : 'FILE');
        echo "  - $item ($type)" . ($is_link ? " -> $link_target" : "") . "\n";
        
        // If it's a directory, list its subdirectories up to 1 level
        if (is_dir($path) && !$is_link) {
            $subitems = @scandir($path);
            if ($subitems !== false) {
                echo "    Sub-items: " . implode(', ', array_diff($subitems, ['.', '..'])) . "\n";
            }
        }
    }
} else {
    echo "$dir is not a directory!\n";
}
?>
