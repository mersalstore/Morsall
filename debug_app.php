<?php
header('Content-Type: text/plain');
$node_dir = '/home/u754458241/domains/morsall.com/public_html/app_new';
$log_file = $node_dir . '/server.log';
$env_file = $node_dir . '/.env';

echo "=== Environment Check ===\n";
if (file_exists($env_file)) {
    echo ".env exists\n";
} else {
    echo ".env NOT found at $env_file\n";
}

echo "\n=== Log File Check ===\n";
if (file_exists($log_file)) {
    echo "Log file exists. Last 100 lines:\n";
    echo file_get_contents($log_file);
} else {
    echo "Log file NOT found at $log_file\n";
}

echo "\n=== App Directory Listing ===\n";
if (is_dir($node_dir)) {
    $files = scandir($node_dir);
    foreach ($files as $file) {
        $path = $node_dir . '/' . $file;
        echo "[" . (is_dir($path) ? "DIR" : "FILE") . "] " . $file . " (" . date("Y-m-d H:i:s", filemtime($path)) . ")\n";
    }
}
?>
