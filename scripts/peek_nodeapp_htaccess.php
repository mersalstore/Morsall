<?php
$target = '/home/u754458241/nodeapp/.htaccess';
if (file_exists($target)) {
    echo "Content of $target:\n";
    echo file_get_contents($target);
} else {
    echo "$target NOT found";
}
?>
