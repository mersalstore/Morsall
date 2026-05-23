<?php
$logFile = '/home/u754458241/domains/morsall.com/public_html/app_new/server.log';
if (file_exists($logFile)) {
    echo "<pre>Last 100 lines of server.log:\n";
    $lines = file($logFile);
    $lastLines = array_slice($lines, -100);
    echo htmlspecialchars(implode("", $lastLines));
    echo "</pre>";
} else {
    echo "server.log NOT FOUND in app_new.";
}
?>
