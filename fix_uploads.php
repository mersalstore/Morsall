<?php
$uploadDir = '/home/u754458241/domains/morsall.com/public_html/app_new/public/uploads';
if (!is_dir($uploadDir)) {
    if (mkdir($uploadDir, 0777, true)) {
        echo "Created uploads directory: $uploadDir\n";
    } else {
        echo "FAILED to create uploads directory.\n";
    }
} else {
    echo "Uploads directory EXISTS.\n";
}

// Set permissions recursively for public/uploads
function set_perms($dir) {
    chmod($dir, 0777);
    $items = scandir($dir);
    foreach ($items as $item) {
        if ($item == '.' || $item == '..') continue;
        $full = $dir . '/' . $item;
        if (is_dir($full)) {
            set_perms($full);
        } else {
            chmod($full, 0666);
        }
    }
}

set_perms($uploadDir);
echo "Set permissions to 777 for $uploadDir and all contents.\n";

// Also check the root public folder
chmod(dirname($uploadDir), 0755);
echo "Set permissions for public folder.\n";
?>
