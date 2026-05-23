<?php
set_time_limit(900);
ini_set('max_execution_time', 900);
ini_set('memory_limit', '512M');

$src = '/home/u754458241/domains/morsall.com/public_html/app_new';
$dst = '/home/u754458241/nodeapp';

function full_copy($source, $target) {
    if (is_dir($source)) {
        if (!is_dir($target)) @mkdir($target, 0755, true);
        $d = dir($source);
        while (FALSE !== ($entry = $d->read())) {
            if ($entry == '.' || $entry == '..') continue;
            full_copy("$source/$entry", "$target/$entry");
        }
        $d->close();
    } else {
        copy($source, $target);
    }
}

echo "Starting copy from $src to $dst...\n";
if (is_dir($src)) {
    full_copy($src, $dst);
    echo "SUCCESS: Copy complete!\n";
} else {
    echo "ERROR: Source directory NOT found!\n";
}
?>
