<?php
$script = '/home/u754458241/domains/morsall.com/public_html/app_new/server.js';
if (file_exists($script)) {
    echo "<pre>";
    echo htmlspecialchars(file_get_contents($script));
    echo "</pre>";
} else {
    echo "server.js NOT FOUND at $script";
}
?>
