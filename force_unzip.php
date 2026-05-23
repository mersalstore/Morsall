<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Current DIR: " . getcwd() . "<br>";
echo "Files in DIR: " . implode(', ', scandir('.')) . "<br>";

$zipFile = isset($_GET['file']) ? $_GET['file'] : 'automated_update.zip';
if (!file_exists($zipFile)) {
    die("❌ Zip file not found: $zipFile");
}

$zip = new ZipArchive;
if ($zip->open($zipFile) === TRUE) {
    echo "📦 Zip opened. Files to extract: " . $zip->numFiles . "<br>";
    for($i = 0; $i < $zip->numFiles; $i++) {
        $filename = $zip->getNameIndex($i);
        if ($zip->extractTo('.', $filename)) {
            // echo "✅ $filename<br>";
        } else {
            echo "❌ $filename<br>";
        }
    }
    $zip->close();
    echo "🏁 Extraction complete!<br>";
    unlink($zipFile);
} else {
    echo "❌ Failed to open zip!";
}
?>
