<?php
$root = '/home/u754458241/domains/morsall.com/app';
chmod($root, 0777);
$f = $root . '/server.log';
file_put_contents($f, "LOG INITIALIZED\n");
chmod($f, 0666);
echo "Permissions updated and server.log initialized.";
?>
