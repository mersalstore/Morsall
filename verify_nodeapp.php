<?php
$contents = scandir('/home/u754458241/nodeapp');
$log = "";
foreach($contents as $item) {
    $log .= $item . "\n";
}
file_put_contents('nodeapp_final_check.txt', $log);
echo "DONE";
?>
