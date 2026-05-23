<?php
$f = '/home/u754458241/domains/morsall.com/nodejs/stderr.log';
if (file_exists($f)) {
    echo "<pre>";
    echo "Last 50 lines of stderr.log:\n";
    $lines = file($f);
    echo implode("", array_slice($lines, -50));
    echo "</pre>";
} else {
    echo "stderr.log NOT FOUND";
}
?>
