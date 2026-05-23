<?php
$htaccess = '/home/u754458241/domains/morsall.com/public_html/.htaccess';
if (file_exists($htaccess)) {
    echo "<b>.htaccess content:</b><br><pre>";
    echo htmlspecialchars(file_get_contents($htaccess));
    echo "</pre>";
} else {
    echo ".htaccess not found in public_html";
}
?>