<?php
$f = '/home/u754458241/domains/morsall.com/nodejs/index.js';
if (file_exists($f)) {
    echo "<pre>";
    echo "Content of $f:\n";
    echo htmlspecialchars(file_get_contents($f));
    echo "</pre>";
} else {
    echo "index.js NOT FOUND at $f";
}
?>
