<?php
for ($port = 3000; $port <= 3010; $port++) {
    $fp = @fsockopen("127.0.0.1", $port, $errno, $errstr, 0.1);
    if ($fp) {
        echo "Port $port is OPEN!\n";
        fclose($fp);
    } else {
        echo "Port $port is closed.\n";
    }
}
?>
