<?php
$f = '/home/u754458241/domains/morsall.com/nodejs/server.log';
file_put_contents($f, "LOG INITIALIZED IN NODEJS FOLDER\n");
chmod($f, 0666);
echo "server.log initialized in nodejs folder.";
?>
