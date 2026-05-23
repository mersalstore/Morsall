<?php
$out = "Real path of /home/u754458241/nodeapp: " . realpath('/home/u754458241/nodeapp') . "\n";
$out .= "Is dir: " . (is_dir('/home/u754458241/nodeapp') ? "YES" : "NO") . "\n";
if (is_dir('/home/u754458241/nodeapp')) {
    $out .= "Contents:\n";
    $out .= print_r(scandir('/home/u754458241/nodeapp'), true);
}
file_put_contents('nodeapp_info.txt', $out);
echo "OK";
?>
