<?php
set_time_limit(600);
$dir = '/home/u754458241/nodeapp';

function fix_slashes($base) {
    $files = scandir($base);
    foreach ($files as $f) {
        if ($f == '.' || $f == '..') continue;
        $path = "$base/$f";
        
        if (strpos($f, '\\') !== false) {
            echo "Fixing: $f\n";
            $parts = explode('\\', $f);
            $current = $base;
            for ($i = 0; $i < count($parts) - 1; $i++) {
                $current .= '/' . $parts[$i];
                if (!is_dir($current)) @mkdir($current, 0755, true);
            }
            $newName = $base . '/' . str_replace('\\', '/', $f);
            rename($path, $newName);
        } else if (is_dir($path)) {
            fix_slashes($path);
        }
    }
}

echo "<pre>";
echo "Fixing backslashes in $dir...\n";
fix_slashes($dir);
echo "✅ Fix complete!\n";
echo "</pre>";
?>
