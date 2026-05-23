<?php
$log = '/home/u754458241/domains/morsall.com/public_html/app_new/server.log';
if (file_exists($log)) {
    unlink($log);
    echo "Deleted server.log. Now visit the site and check again.";
} else {
    echo "server.log NOT FOUND. Try visiting the site first.";
}
?>
