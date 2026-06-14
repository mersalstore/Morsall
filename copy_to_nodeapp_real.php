<?php
header('Content-Type: text/plain; charset=utf-8');
set_time_limit(1800); // 30 minutes
ini_set('max_execution_time', 1800);
ini_set('memory_limit', '512M');

echo "=== Copying nodejs to nodeapp ===\n";

$src = '/home/u754458241/domains/morsall.com/nodejs';
$dst = '/home/u754458241/nodeapp';

if (!is_dir($src)) {
    die("Source folder $src does not exist!");
}

if (!is_dir($dst)) {
    if (!mkdir($dst, 0755, true)) {
        die("Failed to create destination folder $dst");
    }
}

$copied_count = 0;
$skipped_count = 0;

function recursive_copy($source, $target) {
    global $copied_count, $skipped_count;
    
    if (is_dir($source)) {
        if (!is_dir($target)) {
            @mkdir($target, 0755, true);
        }
        $d = dir($source);
        while (FALSE !== ($entry = $d->read())) {
            if ($entry == '.' || $entry == '..') continue;
            
            // Skip large caches or lock files if needed, but copy node_modules and .next
            if ($entry == '.git' || $entry == 'cache' && basename(dirname($source)) == '.next') {
                $skipped_count++;
                continue;
            }
            
            recursive_copy("$source/$entry", "$target/$entry");
        }
        $d->close();
    } else {
        if (@copy($source, $target)) {
            $copied_count++;
            if ($copied_count % 1000 == 0) {
                echo "Copied $copied_count files...\n";
                flush();
            }
        } else {
            echo "Failed to copy: $source -> $target\n";
        }
    }
}

recursive_copy($src, $dst);
echo "\n=== Copy Finished ===\n";
echo "Total copied files: $copied_count\n";
echo "Total skipped items: $skipped_count\n";
?>
