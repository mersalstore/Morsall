<?php
$tmpDir = '/home/u754458241/domains/morsall.com/nodejs/tmp';
if (!is_dir($tmpDir)) {
    mkdir($tmpDir, 0755, true);
}
$restartFile = $tmpDir . '/restart.txt';
if (touch($restartFile)) {
    echo "Successfully touched $restartFile. Passenger should restart the app on next request.";
} else {
    echo "Failed to touch $restartFile";
}
?>
