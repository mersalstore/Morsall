<?php
header('Content-Type: text/plain; charset=utf-8');

echo "=== Realpath Check ===\n";
echo "nodeapp realpath: " . realpath('/home/u754458241/nodeapp') . "\n";
echo "nodejs realpath: " . realpath('/home/u754458241/domains/morsall.com/nodejs') . "\n";
echo "public_html realpath: " . realpath('/home/u754458241/public_html') . "\n";
?>
