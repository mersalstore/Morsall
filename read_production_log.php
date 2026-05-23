<?php
$f = '/home/u754458241/domains/morsall.com/production/server.log';
if (file_exists($f)) {
    echo "<pre>";
    echo "Content of production/server.log:\n";
    echo htmlspecialchars(file_get_contents($f));
    echo "</pre>";
} else {
    echo "server.log NOT FOUND in production folder.";
}
?>
