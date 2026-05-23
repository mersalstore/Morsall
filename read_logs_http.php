<?php
header('Content-Type: text/plain');

$log1 = @file_get_contents('/home/u754458241/domains/morsall.com/nodejs/stderr.log');
$log2 = @file_get_contents('/home/u754458241/domains/morsall.com/nodejs/server.log');

echo "STDERR.LOG:\n";
echo substr($log1, -5000) ?: "Empty or not found";
echo "\n\nSERVER.LOG:\n";
echo substr($log2, -5000) ?: "Empty or not found";
?>
