<?php
function chmod_recursive($path) {
    if (!file_exists($path)) return;
    
    $item = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($path, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    );

    foreach ($item as $name => $object) {
        chmod($name, 0777);
    }
    chmod($path, 0777);
}

chmod_recursive('/home/u754458241/domains/morsall.com/nodejs');
echo "Recursive chmod 777 finished on nodejs folder.";
?>
