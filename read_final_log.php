<?php
$f = '/home/u754458241/domains/morsall.com/public_html/app_new/server.log';
if (file_exists($f)) {
    echo "<pre>";
    echo "Content of app_new/server.log:\n";
    echo htmlspecialchars(file_get_contents($f));
    echo "</pre>";
} else {
    echo "server.log NOT FOUND in app_new.";
    // List files
    echo "<pre>Files in app_new:\n";
    print_r(scandir(dirname($f)));
    echo "</pre>";
}
?>
