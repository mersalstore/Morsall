<?php
$log = '/home/u754458241/domains/morsall.com/public_html/passenger.log';
if (file_exists($log)) {
    echo "<pre>";
    echo "Contents of passenger.log:\n";
    echo htmlspecialchars(file_get_contents($log));
    echo "</pre>";
} else {
    echo "passenger.log NOT FOUND at $log";
}
?>
