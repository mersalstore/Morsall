<?php
$dir = '/home/u754458241/domains/morsall.com/production/';
if (file_exists($dir . 'server.js')) {
    rename($dir . 'server.js', $dir . 'app.js');
    echo "Renamed server.js to app.js in production folder.";
} else {
    echo "server.js not found.";
}
?>
