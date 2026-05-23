<?php
$dirs = [
    '/home/u754458241/logs',
    '/home/u754458241/domains/morsall.com/logs',
    '/home/u754458241/domains/morsall.com/public_html/app_new'
];
echo "<pre>";
foreach ($dirs as $dir) {
    echo "Checking $dir:\n";
    if (is_dir($dir)) {
        $files = scandir($dir);
        foreach ($files as $file) {
            if (strpos($file, '.log') !== false || strpos($file, '.txt') !== false) {
                echo "[ LOG ] $file (" . filesize($dir . '/' . $file) . " bytes)\n";
            }
        }
    } else {
        echo "Dir NOT FOUND: $dir\n";
    }
    echo "\n";
}
echo "</pre>";
?>
