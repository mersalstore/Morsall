<?php
$root = '/home/u754458241/domains/morsall.com/nodejs/';
if (!is_dir($root . 'tmp')) {
    mkdir($root . 'tmp', 0777);
}
$f = $root . 'tmp/restart.txt';
file_put_contents($f, time());
chmod($f, 0777);
echo "Signal file created at $f with 777 perms.";
?>
