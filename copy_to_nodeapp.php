<?php
set_time_limit(600);
$src = '/home/u754458241/domains/morsall.com/public_html/app_new';
$dst = '/home/u754458241/nodeapp';

function full_copy($source, $target) {
    if (is_dir($source)) {
        @mkdir($target, 0755, true);
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
echo "Copying from $src to $dst...\n";
if (is_dir($src)) {
    full_copy($src, $dst);
    echo "✅ Copy complete!\n";
} else {
    echo "❌ Source directory NOT found!\n";
}
echo "</pre>";
?>
