<?php
$files = [
    '/home/u754458241/domains/morsall.com/public_html/app_new/my_app_log.txt',
    '/home/u754458241/domains/morsall.com/public_html/app_new/manual_start.log'
];
echo "<pre>";
foreach ($files as $file) {
    if (file_exists($file)) {
        echo "--- $file (Modified: " . date("Y-m-d H:i:s", filemtime($file)) . ") ---\n";
        echo htmlspecialchars(file_get_contents($file));
        echo "\n\n";
    } else {
        echo "File NOT FOUND: $file\n\n";
    }
}
echo "</pre>";
?>
