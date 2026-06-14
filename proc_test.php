<?php
header('Content-Type: text/plain; charset=utf-8');

echo "=== Process Execution Test ===\n";

$funcs = ['exec', 'shell_exec', 'system', 'proc_open', 'passthru'];
foreach ($funcs as $f) {
    echo "$f: " . (function_exists($f) ? 'ENABLED' : 'DISABLED') . "\n";
}

if (function_exists('shell_exec')) {
    echo "\nTrying shell_exec('node -v'):\n";
    echo shell_exec('node -v') . "\n";
    
    echo "\nTrying shell_exec('which node'):\n";
    echo shell_exec('which node') . "\n";
}
?>
