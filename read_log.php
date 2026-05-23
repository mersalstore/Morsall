<?php
$logPath = '/home/u754458241/domains/morsall.com/nodejs/server.log';
if (file_exists($logPath)) {
    echo "--- server.log ---<br>";
    $lines = file($logPath);
    $last_lines = array_slice($lines, -40);
    echo nl2br(implode('', $last_lines));
} else {
    echo "server.log NOT FOUND";
}
?>
