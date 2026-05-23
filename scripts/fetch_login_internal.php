<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://127.0.0.1:3000/login");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
curl_setopt($ch, CURLOPT_TIMEOUT, 30); // Increased timeout
$output = curl_exec($ch);
$info = curl_getinfo($ch);
$err = curl_error($ch);
curl_close($ch);

echo "HTTP Code: " . $info['http_code'] . "\n";
echo "Error: " . $err . "\n";
echo "Response Length: " . strlen($output) . "\n";
if ($output) {
    echo "First 2000 chars:\n" . substr($output, 0, 2000) . "\n";
}
file_put_contents('login_internal.html', $output);
?>
