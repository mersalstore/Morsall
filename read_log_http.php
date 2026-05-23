<?php
$logPath = '../nodejs/stderr.log';
if (file_exists($logPath)) {
    echo "=== LOG CONTENT (LAST 100 LINES) ===\n";
    $lines = array_slice(file($logPath), -100);
    echo implode("", $lines);
} else {
    echo "Log file not found: $logPath";
}
?>
