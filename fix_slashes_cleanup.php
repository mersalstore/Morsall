<?php
header('Content-Type: text/plain');
set_time_limit(900);
$dir = '/home/u754458241/nodeapp';

function log_msg($msg) { echo $msg . "\n"; ob_flush(); flush(); }

function fix_slashes_deep($base) {
    $items = @scandir($base);
    if (!$items) return;

    foreach ($items as $item) {
        if ($item == '.' || $item == '..') continue;
        $fullPath = "$base/$item";
        
        if (strpos($item, '\\') !== false) {
            $finalPath = $base . '/' . str_replace('\\', '/', $item);
            
            // Create target directory structure
            $dirPath = dirname($finalPath);
            if (!is_dir($dirPath)) @mkdir($dirPath, 0755, true);

            if (is_dir($fullPath)) {
                log_msg("Fixing DIR: $item");
                if (!is_dir($finalPath)) @mkdir($finalPath, 0755, true);
                // We should technically move contents, but usually these are empty shells
                @rmdir($fullPath); 
            } else {
                log_msg("Fixing FILE: $item");
                if (@rename($fullPath, $finalPath)) {
                    // Success
                } else {
                    // If rename fails, try copy then unlink
                    if (@copy($fullPath, $finalPath)) @unlink($fullPath);
                }
            }
        } else if (is_dir($fullPath) && basename($fullPath) != 'node_modules') {
            fix_slashes_deep($fullPath);
        }
    }
}

log_msg("Starting FINAL CLEANUP in $dir...");
fix_slashes_deep($dir);
log_msg("✅ Cleanup complete!");
?>
