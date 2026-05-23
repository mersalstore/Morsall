<?php
$dir = '/home/u754458241/domains/morsall.com/nodejs/';
if (file_exists($dir . 'app.js')) {
    rename($dir . 'app.js', $dir . 'server.js');
    echo "Renamed app.js back to server.js in nodejs folder.";
}
?>
