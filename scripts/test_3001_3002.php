<?php
function testPort($port) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "http://127.0.0.1:$port/");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_TIMEOUT, 2);
    $output = curl_exec($ch);
    curl_close($ch);
    return $output;
}

echo "Response from 3001:\n" . testPort(3001) . "\n";
echo "Response from 3002:\n" . testPort(3002) . "\n";
?>
