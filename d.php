<?php
header('Content-Type: text/plain');
$node_dir = '/home/u754458241/domains/morsall.com/nodejs';
$log_file = $node_dir . '/logs/stderr.log';
$env_file = $node_dir . '/.env';

echo "=== Environment Check ===\n";
if (file_exists($env_file)) {
    echo ".env exists\n";
    $env = file_get_contents($env_file);
    // Mask password
    echo preg_replace('/:(.*)@/', ':***@', $env);
} else {
    echo ".env NOT found at $env_file\n";
}

echo "\n=== Log File Check ===\n";
if (file_exists($log_file)) {
    echo "Log file exists. Last 100 lines:\n";
    $lines = explode("\n", file_get_contents($log_file));
    echo implode("\n", array_slice($lines, -100));
} else {
    echo "Log file NOT found at $log_file\n";
}

echo "\n=== Node Directory Listing ===\n";
if (is_dir($node_dir)) {
    $files = scandir($node_dir);
    foreach ($files as $file) {
        echo $file . "\n";
    }
}
?>
