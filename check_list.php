<?php
$contents = scandir('/home/u754458241/nodeapp');
file_put_contents('nodeapp_listing.txt', print_r($contents, true));
echo "LISTING DONE";
?>
