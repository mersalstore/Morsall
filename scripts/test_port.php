<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://82.198.228.182:3000/");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$output = curl_exec($ch);
$info = curl_getinfo($ch);
curl_close($ch);

echo "Response from 127.0.0.1:3000:\n";
echo $output;
echo "\n\nCURL Info:\n";
print_r($info);
?>
