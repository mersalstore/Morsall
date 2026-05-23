<?php
// Simple unzipper script
$file = isset($_GET['file']) ? $_GET['file'] : '';
$target = isset($_GET['target']) ? $_GET['target'] : '.';

if (!$file) {
    die("Error: Please specify '?file=path/to/file.zip'");
}

if (!file_exists($file)) {
    die("Error: File '$file' does not exist.");
}

$zip = new ZipArchive;
if ($zip->open($file) === TRUE) {
    if ($zip->extractTo($target)) {
        echo "SUCCESS: Extracted '$file' to '$target' successfully!";
    } else {
        echo "ERROR: Failed to extract '$file' to '$target'. Check permissions.";
    }
    $zip->close();
} else {
    echo "ERROR: Could not open zip file '$file'.";
}
