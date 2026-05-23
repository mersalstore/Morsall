<?php
$zipFile = __DIR__ . '/image_assets_2026.png';

if (!file_exists($zipFile)) {
    echo "Directory contents of " . __DIR__ . ":<br>";
    $files = scandir(__DIR__);
    foreach ($files as $file) {
        echo $file . "<br>";
    }
    die("Error: fixes.dat not found at $zipFile");
}

if (!class_exists('ZipArchive')) {
    die("Error: ZipArchive class not found.");
}

$zip = new ZipArchive;
$res = $zip->open($zipFile);
if ($res === TRUE) {
    // Extract everything file-by-file for maximum reliability
    $tempDir = '/home/u754458241/domains/morsall.com/temp_fixes';
    @mkdir($tempDir);
    for ($i = 0; $i < $zip->numFiles; $i++) {
        $filename = $zip->getNameIndex($i);
        $res = $zip->extractTo($tempDir, $filename);
        if ($res === false) {
            echo "Failed to extract: $filename<br>";
        } else {
            echo "Extracted: $filename<br>";
        }
    }
    $zip->close();
    
    // Move files to their correct locations
    $nodejsDir = '/home/u754458241/domains/morsall.com/nodejs';
    $publicDir = '/home/u754458241/domains/morsall.com/public_html';
    
    // 1. Move server.js
    echo "Files in tempDir: " . implode(', ', scandir($tempDir)) . "<br>";
    copy($tempDir . '/server.js', $nodejsDir . '/server.js');
    echo "server.js updated.<br>";
    if (file_exists($tempDir . '/server-hostinger.js')) {
        copy($tempDir . '/server-hostinger.js', $nodejsDir . '/server-hostinger.js');
        echo "server-hostinger.js updated.<br>";
    }
    
    // 2. Move .htaccess
    copy($tempDir . '/.htaccess', $publicDir . '/.htaccess');
    echo ".htaccess updated.<br>";
    
    // 3. Move .next folder recursively
    function recurse_copy($src,$dst) {
        $dir = opendir($src);
        @mkdir($dst);
        while(false !== ( $file = readdir($dir)) ) {
            if (( $file != '.' ) && ( $file != '..' )) {
                if ( is_dir($src . '/' . $file) ) {
                    recurse_copy($src . '/' . $file,$dst . '/' . $file);
                } else {
                    copy($src . '/' . $file,$dst . '/' . $file);
                }
            }
        }
        closedir($dir);
    }
    recurse_copy($tempDir . '/.next', $nodejsDir . '/.next');
    echo ".next folder updated.<br>";
    
    // 4. Move public folder recursively
    if (is_dir($tempDir . '/public')) {
        recurse_copy($tempDir . '/public', $nodejsDir . '/public');
        echo "public folder updated.<br>";
    }
    
    // Cleanup
    function rrmdir($dir) {
        if (is_dir($dir)) {
            $objects = scandir($dir);
            foreach ($objects as $object) {
                if ($object != "." && $object != "..") {
                    if (is_dir($dir. DIRECTORY_SEPARATOR .$object) && !is_link($dir."/".$object))
                        rrmdir($dir. DIRECTORY_SEPARATOR .$object);
                    else
                        unlink($dir. DIRECTORY_SEPARATOR .$object);
                }
            }
            rmdir($dir);
        }
    }
    rrmdir($tempDir);
    @unlink($zipFile);
    
    // Restart nodeapp
    @mkdir($nodejsDir . '/tmp');
    @touch($nodejsDir . '/tmp/restart.txt');
    echo "Server restarted.<br>";
    echo "DONE.";
} else {
    echo "Error unzipping.";
}
?>
