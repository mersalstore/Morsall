<?php
$pkg = '/home/u754458241/domains/morsall.com/public_html/app_new/package.json';
if (file_exists($pkg)) {
    echo "<pre>";
    echo htmlspecialchars(file_get_contents($pkg));
    echo "</pre>";
} else {
    echo "package.json NOT FOUND.";
}
?>
