<?php
$publicDir = '/home/u754458241/domains/morsall.com/nodejs/public';

echo "--- Appending Logo Fixes ---<br>";

// We have several files. Let's see if icon-mersal.png exists
$sourceIcon = $publicDir . '/icon-mersal.png';
if (file_exists($sourceIcon)) {
    echo "icon-mersal.png found. Size: " . filesize($sourceIcon) . " bytes.<br>";
    
    // Copy to logo-navbar-final.png
    if (copy($sourceIcon, $publicDir . '/logo-navbar-final.png')) {
        echo "Copied icon-mersal.png to logo-navbar-final.png successfully.<br>";
    } else {
        echo "Failed to copy to logo-navbar-final.png.<br>";
    }
    
    // Copy to favicon.ico
    if (copy($sourceIcon, $publicDir . '/favicon.ico')) {
        echo "Copied icon-mersal.png to favicon.ico successfully.<br>";
    }
    
    // Copy to icon.png
    if (copy($sourceIcon, $publicDir . '/icon.png')) {
        echo "Copied icon-mersal.png to icon.png successfully.<br>";
    }
    
    // Copy to apple-icon.png
    if (copy($sourceIcon, $publicDir . '/apple-icon.png')) {
        echo "Copied icon-mersal.png to apple-icon.png successfully.<br>";
    }
} else {
    echo "icon-mersal.png NOT found at $sourceIcon.<br>";
}

// Let's also check logo-final-brand.png or footer-logo.png
$sourceLogo = $publicDir . '/footer-logo.png';
if (file_exists($sourceLogo)) {
    echo "footer-logo.png found. Size: " . filesize($sourceLogo) . " bytes.<br>";
}

echo "Logo copy process finished.";
?>
