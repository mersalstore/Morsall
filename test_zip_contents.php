<?php
$zipFile = __DIR__ . '/image_assets_2026.png';
$zip = new ZipArchive;
if ($zip->open($zipFile) === TRUE) {
    echo "ZIP_FILES:<br>";
    for ($i = 0; $i < $zip->numFiles; $i++) {
        $name = $zip->getNameIndex($i);
        if (strpos($name, '/') === false || count(explode('/', $name)) <= 2) {
            echo $name . "<br>";
        }
    }
    $zip->close();
} else {
    echo "FAILED_TO_OPEN_ZIP";
}
?>
