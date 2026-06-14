<?php
header('Content-Type: text/plain; charset=utf-8');
$secret = $_GET['v'] ?? '';
if ($secret !== 'forceextract2026') {
    die('Access Denied');
}
set_time_limit(300);

$nodejsDir = '/home/u754458241/domains/morsall.com/nodejs';
$publicHtml = '/home/u754458241/domains/morsall.com/public_html';

$zipLocal = "$publicHtml/fast_update.zip";
$zipNode = "$nodejsDir/fast_update.zip";
$zipPath = file_exists($zipNode) ? $zipNode : (file_exists($zipLocal) ? $zipLocal : null);

if (!$zipPath) die("fast_update.zip not found in nodejs or public_html\n");
echo "Found zip: $zipPath (" . round(filesize($zipPath)/1024/1024, 2) . " MB)\n";

$zip = new ZipArchive;
if ($zip->open($zipPath) !== TRUE) die("Failed to open zip\n");

echo "Zip has {$zip->numFiles} files. Extracting with FORCE overwrite...\n";

$written = 0;
$failed = 0;
$skipped = 0;

for ($i = 0; $i < $zip->numFiles; $i++) {
    $name = $zip->getNameIndex($i);
    if (substr($name, -1) === '/') continue; // skip dirs

    $target = "$nodejsDir/$name";
    $targetDir = dirname($target);

    if (!is_dir($targetDir)) {
        @mkdir($targetDir, 0755, true);
    }

    // Force-remove existing file so we always write fresh content
    if (file_exists($target)) {
        @chmod($target, 0644);
        @unlink($target);
    }

    $stream = $zip->getStream($name);
    if (!$stream) { $failed++; continue; }
    $data = stream_get_contents($stream);
    fclose($stream);

    if (file_put_contents($target, $data) !== false) {
        $written++;
    } else {
        $failed++;
    }
}
$zip->close();

echo "Written: $written | Failed: $failed\n";

// Copy _next/static to public_html
$srcStatic = "$nodejsDir/.next/static";
$dstStatic = "$publicHtml/_next/static";
if (is_dir($srcStatic)) {
    @mkdir(dirname($dstStatic), 0755, true);
    // best-effort recursive copy
    function rcopy($src, $dst) {
        if (!is_dir($src)) return;
        @mkdir($dst, 0755, true);
        foreach (scandir($src) as $f) {
            if ($f === '.' || $f === '..') continue;
            $s = "$src/$f"; $d = "$dst/$f";
            if (is_dir($s)) rcopy($s, $d);
            else { @unlink($d); @copy($s, $d); }
        }
    }
    rcopy($srcStatic, $dstStatic);
    echo "Copied _next/static to public_html\n";
}

// Delete zip
@unlink($zipPath);
echo "Deleted zip\n";

// Verify the target file we care about
$check = "$nodejsDir/.next/server/app/api/vendor/subscribe-bank/route.js";
if (file_exists($check)) {
    $content = file_get_contents($check);
    echo "\nVERIFY subscribe-bank/route.js:\n";
    echo "  size: " . strlen($content) . " bytes\n";
    echo "  has 'rejected': " . (strpos($content, 'rejected') !== false ? 'YES' : 'NO') . "\n";
    echo "  has 'amountMissing': " . (strpos($content, 'amountMissing') !== false ? 'YES' : 'NO') . "\n";
}

// Restore proper .htaccess (Passenger enabled)
$htaccess = "PassengerEnabled on\nPassengerAppType node\nPassengerStartupFile server.js\nPassengerAppRoot $nodejsDir\nPassengerNodejs /opt/alt/alt-nodejs20/root/usr/bin/node\nPassengerLogFile $nodejsDir/passenger.log\n\nOptions -MultiViews -Indexes\nRewriteEngine On\nRewriteBase /\nRewriteCond %{REQUEST_FILENAME} !-d\nRewriteRule ^(.*)/$ /\$1 [L,R=301]\n";
file_put_contents("$publicHtml/.htaccess", $htaccess);
echo "\nRestored .htaccess (Passenger on)\n";

// Restart
$rp = "$nodejsDir/tmp/restart.txt";
if (!is_dir(dirname($rp))) @mkdir(dirname($rp), 0755, true);
@touch($rp);
echo "Touched restart.txt\n";

echo "\nDONE\n";
