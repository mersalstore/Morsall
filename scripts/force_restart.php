<?php
$restartFile = '/home/u754458241/domains/morsall.com/public_html/app_new/tmp/restart.txt';
if (touch($restartFile)) {
    echo "Successfully touched $restartFile";
} else {
    echo "Failed to touch $restartFile";
}
?>
