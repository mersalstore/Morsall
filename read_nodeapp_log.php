<?php
$logFile = '/home/u754458241/nodeapp/stderr.log';
echo "Reading log: $logFile\n\n";
if (file_exists($logFile)) {
    echo shell_exec("tail -n 50 " . escapeshellarg($logFile));
} else {
    echo "Log file NOT FOUND at $logFile";
}
?>
