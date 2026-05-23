<?php
$log = '/home/u754458241/domains/morsall.com/public_html/app_new/my_app_log.txt';
if (file_exists($log)) {
    echo "<pre>";
    echo "Contents of my_app_log.txt:\n";
    echo htmlspecialchars(file_get_contents($log));
    echo "</pre>";
} else {
    echo "my_app_log.txt NOT FOUND at $log";
}
?>
