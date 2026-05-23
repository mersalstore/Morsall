<?php
set_time_limit(900);
$dir = '/home/u754458241/nodeapp';

function fix_slashes_recursive($base) {
    $items = scandir($base);
    foreach ($items as $item) {
        if ($item == '.' || $item == '..') continue;
        $fullPath = "$base/$item";
        
        if (strpos($item, '\\') !== false) {
            echo "Processing: $item\n";
            $parts = explode('\\', $item);
            $current = $base;
            
            // Create directories
            for ($i = 0; $i < count($parts) - 1; $i++) {
                if (empty($parts[$i])) continue;
                $current .= '/' . $parts[$i];
                if (!is_dir($current)) {
                    if (@mkdir($current, 0755, true)) {
                        echo "  Created dir: $current\n";
                    }
                }
            }
            
            // Final destination path
            $finalPath = $base . '/' . str_replace('\\', '/', $item);
            
            // If it's a directory with a trailing slash in the name
            if (substr($item, -1) == '\\') {
                $finalPath = rtrim($finalPath, '/');
                if (!is_dir($finalPath)) @mkdir($finalPath, 0755, true);
                echo "  Fixed dir name: $finalPath\n";
                // Optionally move contents if it was a dir, but here it's likely a file/dir name error
            } else {
                if (rename($fullPath, $finalPath)) {
                    echo "  Moved to: $finalPath\n";
                } else {
                    echo "  FAILED to move $item\n";
                }
            }
        } else if (is_dir($fullPath)) {
            fix_slashes_recursive($fullPath);
        }
    }
}

echo "<pre>";
echo "Starting Deep Fix in $dir...\n";
fix_slashes_recursive($dir);
echo "✅ Deep Fix complete!\n";
echo "</pre>";
?>
