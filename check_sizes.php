<?php
$files = [
    '/home/u754458241/domains/morsall.com/nodejs/server-hostinger.js',
    '/home/u754458241/domains/morsall.com/nodejs/server.js',
    '/home/u754458241/domains/morsall.com/nodejs/app.js',
    '/home/u754458241/nodeapp/server-hostinger.js',
    '/home/u754458241/nodeapp/server.js',
    '/home/u754458241/nodeapp/app.js',
];

foreach ($files as $f) {
    if (file_exists($f)) {
        echo "<b>$f</b>: Size = " . filesize($f) . " bytes, Modified = " . date("Y-m-d H:i:s", filemtime($f)) . "<br>";
    } else {
        echo "<b>$f</b>: NOT FOUND<br>";
    }
}
?>