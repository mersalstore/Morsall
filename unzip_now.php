<?php
\ = __DIR__ . '/fast_update.zip';
\ = __DIR__ . '/app_new';
if (file_exists(\)) {
    \ = new ZipArchive;
    if (\->open(\) === TRUE) {
        \->extractTo(\);
        \->close();
        echo 'Success: Extracted to ' . \;
    } else {
        echo 'Error: Failed to open zip';
    }
} else {
    echo 'Error: Zip not found at ' . \;
}
?>
