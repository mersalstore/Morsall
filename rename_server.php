<?php
$root = '/home/u754458241/domains/morsall.com/nodejs/';
if (file_exists($root . 'server.js')) {
    rename($root . 'server.js', $root . 'server.js.bak');
}
copy($root . 'app.js', $root . 'server.js');
echo "Renamed app.js to server.js and backed up old server.js";
?>
