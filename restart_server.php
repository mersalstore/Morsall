<?php
$restartFile = '/home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt';
$dir = dirname($restartFile);
if (!is_dir($dir)) { mkdir($dir, 0755, true); }
file_put_contents($restartFile, date('Y-m-d H:i:s'));
echo "Server restart triggered at: " . date('Y-m-d H:i:s');
?>
