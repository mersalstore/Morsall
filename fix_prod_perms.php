<?php
chmod('/home/u754458241/domains/morsall.com/production', 0777);
// Recursive chmod for top level files
$dir = '/home/u754458241/domains/morsall.com/production/';
chmod($dir . 'server.js', 0777);
chmod($dir . 'server.log', 0777);
chmod($dir . '.env', 0777);
echo "Permissions updated for production folder and core files.";
?>
