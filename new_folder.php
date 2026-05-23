<?php
$root = '/home/u754458241/domains/morsall.com/';
rename($root . 'nodejs', $root . 'nodejs_delete_' . time());
mkdir($root . 'app', 0755);
echo "Renamed nodejs and created /app folder.";
?>
