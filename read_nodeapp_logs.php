<?php
header('Content-Type: text/plain; charset=utf-8');

echo "=== Reading Nodeapp Logs ===\n";

$stderr_file = '/home/u754458241/nodeapp/stderr.log';
$server_file = '/home/u754458241/nodeapp/server.log';

echo "\nChecking stderr.log:\n";
if (file_exists($stderr_file)) {
    echo "  Exists: Yes\n";
    echo "  Size: " . filesize($stderr_file) . " bytes\n";
    $lines = file($stderr_file);
    echo "  Last 30 lines:\n";
    $last_lines = array_slice($lines, -30);
    foreach ($last_lines as $l) {
        echo "    " . trim($l) . "\n";
    }
} else {
    echo "  Exists: No\n";
}

echo "\nChecking server.log:\n";
if (file_exists($server_file)) {
    echo "  Exists: Yes\n";
    echo "  Size: " . filesize($server_file) . " bytes\n";
    $lines = file($server_file);
    echo "  Last 30 lines:\n";
    $last_lines = array_slice($lines, -30);
    foreach ($last_lines as $l) {
        echo "    " . trim($l) . "\n";
    }
} else {
    echo "  Exists: No\n";
}
?>
