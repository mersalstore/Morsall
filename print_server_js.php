<?php
header('Content-Type: text/plain; charset=utf-8');
$file = '/home/u754458241/domains/morsall.com/nodejs/server.js';
if (file_exists($file)) {
    echo file_get_contents($file);
} else {
    echo "File not found!";
}
?>
