<?php
$src = '/home/u754458241/domains/morsall.com/public_html/app_new/.next';
$dest = '/home/u754458241/domains/morsall.com/public_html/.next';

function full_copy($source, $target) {
    if (is_dir($source)) {
        @mkdir($target);
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

echo "<pre>";
echo "Syncing .next from $src to $dest...\n";
full_copy($src, $dest);
echo "Done.\n";
echo "</pre>";
?>
