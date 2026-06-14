<?php
header('Content-Type: text/plain; charset=utf-8');

echo "=== Node Binary Scanner ===\n";

$potential_paths = [
    '/opt/alt/alt-nodejs20/root/usr/bin/node',
    '/opt/alt/alt-nodejs18/root/usr/bin/node',
    '/opt/alt/alt-nodejs16/root/usr/bin/node',
    '/opt/alt/alt-nodejs14/root/usr/bin/node',
    '/usr/bin/node',
    '/usr/local/bin/node',
];

// Scan home directory for nodevenv
$home = '/home/u754458241';
if (is_dir($home)) {
    $files = @scandir($home);
    if ($files !== false) {
        foreach ($files as $f) {
            if (strpos($f, 'nodevenv') !== false || strpos($f, 'node') !== false) {
                $path = "$home/$f";
                echo "Found home item: $f\n";
                // Scan recursively 3 levels
                scan_for_node($path, 0);
            }
        }
    }
}

foreach ($potential_paths as $p) {
    if (@file_exists($p)) {
        echo "Found Node Binary: $p\n";
        test_node($p);
    }
}

function scan_for_node($dir, $depth) {
    if ($depth > 4) return;
    if (!is_dir($dir)) return;
    $items = @scandir($dir);
    if ($items === false) return;
    foreach ($items as $item) {
        if ($item === '.' || $item === '..') continue;
        $path = "$dir/$item";
        if (is_dir($path)) {
            if ($item === 'bin') {
                if (@file_exists("$path/node")) {
                    echo "Found Node Binary in venv: $path/node\n";
                    test_node("$path/node");
                }
            }
            scan_for_node($path, $depth + 1);
        }
    }
}

function test_node($bin) {
    $descriptorspec = [
        1 => ["pipe", "w"],
        2 => ["pipe", "w"]
    ];
    $process = @proc_open("$bin -v", $descriptorspec, $pipes);
    if (is_resource($process)) {
        $out = stream_get_contents($pipes[1]);
        fclose($pipes[1]);
        $err = stream_get_contents($pipes[2]);
        fclose($pipes[2]);
        proc_close($process);
        echo "  Version: " . trim($out) . " (Err: " . trim($err) . ")\n";
    } else {
        echo "  Failed to run proc_open on $bin\n";
    }
}
?>
