<?php
$ht = '/home/u754458241/domains/morsall.com/public_html/.htaccess';
if (file_exists($ht)) {
    echo "<pre>";
    echo htmlspecialchars(file_get_contents($ht));
    echo "</pre>";
} else {
    echo ".htaccess NOT FOUND at $ht";
}
?>
