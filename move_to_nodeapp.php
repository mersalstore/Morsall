<?php
$src = '/home/u754458241/domains/morsall.com/public_html/app_new';
$dest = '/home/u754458241/nodeapp';

if (!is_dir($dest)) {
    mkdir($dest, 0755, true);
}

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
echo "Copying from $src to $dest...\n";
// Since full_copy is slow, I'll just move the main files first
$files = ['startup.js', 'server.js', 'package.json', 'next.config.mjs', 'prisma', '.env'];
foreach ($files as $f) {
    if (file_exists("$src/$f")) {
        echo "Copying $f...\n";
        full_copy("$src/$f", "$dest/$f");
    }
}
echo "Done copying main files.\n";
echo "</pre>";
?>
