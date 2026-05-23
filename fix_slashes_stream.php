<?php
header('Content-Type: text/plain');
header('Cache-Control: no-cache');
set_time_limit(900);
$dir = '/home/u754458241/nodeapp';

function log_msg($msg) {
    echo $msg . "\n";
    ob_flush();
    flush();
}

function fix_slashes_recursive($base, $skipNodeModules = true) {
    if ($skipNodeModules && basename($base) == 'node_modules') return;
    
    $items = @scandir($base);
    if (!$items) return;

    foreach ($items as $item) {
        if ($item == '.' || $item == '..') continue;
        $fullPath = "$base/$item";
        
        if (strpos($item, '\\') !== false) {
            log_msg("Processing: $item");
            $parts = explode('\\', $item);
            $current = $base;
            
            for ($i = 0; $i < count($parts) - 1; $i++) {
                if (empty($parts[$i])) continue;
                $current .= '/' . $parts[$i];
                if (!is_dir($current)) {
                    @mkdir($current, 0755, true);
                }
            }
            
            $finalPath = $base . '/' . str_replace('\\', '/', $item);
            if (substr($item, -1) == '\\') {
                $finalPath = rtrim($finalPath, '/');
                if (!is_dir($finalPath)) @mkdir($finalPath, 0755, true);
            } else {
                @rename($fullPath, $finalPath);
            }
        } else if (is_dir($fullPath)) {
            fix_slashes_recursive($fullPath, $skipNodeModules);
        }
    }
}

log_msg("Starting Streamed Fix in $dir...");
if (is_dir("$dir/.next")) fix_slashes_recursive("$dir/.next", false);
if (is_dir("$dir/.prisma")) fix_slashes_recursive("$dir/.prisma", false);
fix_slashes_recursive($dir, true); 

log_msg("✅ Streamed Fix complete!");
?>
