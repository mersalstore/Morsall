<?php
$log = '/home/u754458241/domains/morsall.com/public_html/app_new/server.log';
if (file_exists($log)) {
    echo "<pre>";
    echo "Contents of server.log:\n";
    echo htmlspecialchars(file_get_contents($log));
    echo "</pre>";
} else {
    echo "server.log NOT FOUND at $log";
}
?>
