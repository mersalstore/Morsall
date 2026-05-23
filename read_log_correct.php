<?php
$log = '/home/u754458241/domains/morsall.com/public_html/app_new/server.log';
if (file_exists($log)) {
    echo "<pre>";
    echo "Last 100 lines of server.log:\n";
    $lines = explode("\n", file_get_contents($log));
    echo htmlspecialchars(implode("\n", array_slice($lines, -100)));
    echo "</pre>";
} else {
    echo "server.log NOT FOUND at $log";
}
?>
