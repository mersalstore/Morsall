<?php
$dir = '/home/u754458241/domains/morsall.com/nodejs';
echo "Contents of $dir:\n";
print_r(scandir($dir));

$env = $dir . '/.env';
if (file_exists($env)) {
    echo "\n.env exists. Content:\n";
    echo file_get_contents($env);
} else {
    echo "\n.env NOT found at $env";
}
?>
