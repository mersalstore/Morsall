<?php
$source = __DIR__;
$dest = __DIR__ . "/../nodejs";

function copy_recursive($src, $dst) {
    if (!file_exists($src)) return;
    $dir = opendir($src);
    @mkdir($dst);
    while(false !== ( $file = readdir($dir)) ) {
        if (( $file != '.' ) && ( $file != '..' )) {
            if ( is_dir($src . '/' . $file) ) {
                copy_recursive($src . '/' . $file, $dst . '/' . $file);
            }
            else {
                copy($src . '/' . $file, $dst . '/' . $file);
            }
        }
    }
    closedir($dir);
}

echo "Syncing source '$source' to destination '$dest'...<br>";
// Only sync important files to avoid infinite loops or overwriting node_modules symlink
$items = ['.next', '_next', 'public', 'src', 'prisma', 'node_modules/.prisma', 'node_modules/@prisma', 'server-hostinger.js', '.env.production', 'package.json', 'next.config.js', 'server.js', '.htaccess', 'start_morsall.js'];

foreach ($items as $item) {
    // Avoid self-copying if source is nodejs destination directory
    if (realpath($source) === realpath("$dest/$item") || realpath($source) === realpath($dest)) continue;
    
    $s = "$source/$item";
    $d = "$dest/$item";
    if (file_exists($s)) {
        if (is_dir($s)) {
            echo "Copying DIR $item... ";
            copy_recursive($s, $d);
            echo "Done<br>";
        } else {
            echo "Copying FILE $item... ";
            copy($s, $d);
            echo "Done<br>";
        }
    }
}

// Reverse-sync static assets: copy from nodejs/.next/static back to public_html/_next/static
// This ensures Apache always has the latest CSS/JS files and chunk mappings!
echo "Syncing static assets back to public_html/_next/static... ";
$static_src = "$dest/.next/static";
$static_dst = __DIR__ . "/_next/static";
if (is_dir($static_src)) {
    copy_recursive($static_src, $static_dst);
    echo "Done<br>";
} else {
    echo "FAILED: Static source not found at $static_src<br>";
}

// Touch restart
if (!is_dir("$dest/tmp")) mkdir("$dest/tmp");
file_put_contents("$dest/tmp/restart.txt", time());
echo "Restart signal sent to nodejs.<br>";
?>
