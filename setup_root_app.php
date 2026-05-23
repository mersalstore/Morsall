<?php
$root = '/home/u754458241/domains/morsall.com/public_html/app';
if (!is_dir($root)) {
    mkdir($root, 0755);
}
copy('/home/u754458241/domains/morsall.com/public_html/app.js', $root . '/app.js');
echo "Moved app.js to public_html/app/app.js";
?>
