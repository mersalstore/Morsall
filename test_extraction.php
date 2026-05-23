<?php
$zipFile = __DIR__ . '/image_assets_2026.png';
$tempDir = '/home/u754458241/domains/morsall.com/temp_fixes';
@mkdir($tempDir);

$zip = new ZipArchive;
if ($zip->open($zipFile) === TRUE) {
    echo "Extracting server-hostinger.js...<br>";
    $res1 = $zip->extractTo($tempDir, 'server-hostinger.js');
    echo "Result for server-hostinger.js: " . ($res1 ? "SUCCESS" : "FAILED") . "<br>";
    
    echo "Extracting server.js...<br>";
    $res2 = $zip->extractTo($tempDir, 'server.js');
    echo "Result for server.js: " . ($res2 ? "SUCCESS" : "FAILED") . "<br>";
    
    echo "Files in tempDir: " . implode(', ', scandir($tempDir)) . "<br>";
    $zip->close();
} else {
    echo "FAILED_TO_OPEN_ZIP";
}
?>
