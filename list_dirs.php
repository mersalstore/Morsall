<?php
echo "<pre>";
echo "Current User: " . get_current_user() . "\n";
echo "Current Path: " . __DIR__ . "\n";
echo "Listing /home/u754458241/domains/morsall.com/:\n";
$files = scandir('/home/u754458241/domains/morsall.com/');
print_r($files);
echo "</pre>";
?>
