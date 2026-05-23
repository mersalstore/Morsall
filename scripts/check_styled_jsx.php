<?php
$target = '/home/u754458241/nodeapp/node_modules/styled-jsx';
if (is_dir($target)) {
    echo "$target EXISTS. Contents:\n";
    print_r(scandir($target));
} else {
    echo "$target DOES NOT EXIST";
}
?>
