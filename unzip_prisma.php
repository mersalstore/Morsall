<?php
$zipFile = '/home/u754458241/domains/morsall.com/nodejs/prisma_client.zip';
$extractTo = '/home/u754458241/domains/morsall.com/nodejs/node_modules/';

if (!file_exists($zipFile)) {
    die("Zip file not found: $zipFile");
}

$zip = new ZipArchive;
if ($zip->open($zipFile) === TRUE) {
    $zip->extractTo($extractTo);
    $zip->close();
    echo "Successfully extracted Prisma client to $extractTo\n";
    // Cleanup
    unlink($zipFile);
} else {
    echo "Failed to open zip file\n";
}
?>
