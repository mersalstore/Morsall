<?php
$file = __DIR__ . '/image_assets_2026.png';
if (file_exists($file)) {
    echo "SIZE: " . filesize($file) . " bytes<br>";
    echo "MTIME: " . date("Y-m-d H:i:s", filemtime($file)) . "<br>";
} else {
    echo "FILE_NOT_FOUND";
}
?>
