<?php
echo "Real path of /home/u754458241/nodeapp: " . realpath('/home/u754458241/nodeapp') . "\n";
echo "Is dir: " . (is_dir('/home/u754458241/nodeapp') ? "YES" : "NO") . "\n";
if (is_dir('/home/u754458241/nodeapp')) {
    echo "Contents:\n";
    print_r(scandir('/home/u754458241/nodeapp'));
}
?>
