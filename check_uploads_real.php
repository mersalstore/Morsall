<?php
$uploadDir = '/home/u754458241/domains/morsall.com/public_html/app_new/public/uploads';
echo "<pre>Checking $uploadDir:\n";
if (is_dir($uploadDir)) {
    $files = scandir($uploadDir);
    foreach ($files as $file) {
        if ($file == '.' || $file == '..') continue;
        $full = $uploadDir . '/' . $file;
        echo "[F] $file (" . date("Y-m-d H:i:s", filemtime($full)) . ") - " . filesize($full) . " bytes\n";
    }
} else {
    echo "Directory NOT FOUND.\n";
}
echo "</pre>";
?>
