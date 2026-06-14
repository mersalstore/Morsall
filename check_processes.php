<?php
header('Content-Type: text/plain; charset=utf-8');

echo "=== Listing Running Processes ===\n";

if (!function_exists('proc_open')) {
    die("proc_open is disabled");
}

$descriptorspec = [
    1 => ["pipe", "w"],
    2 => ["pipe", "w"]
];

$process = proc_open("ps aux", $descriptorspec, $pipes);

if (is_resource($process)) {
    $stdout = stream_get_contents($pipes[1]);
    fclose($pipes[1]);
    $stderr = stream_get_contents($pipes[2]);
    fclose($pipes[2]);
    proc_close($process);

    echo "=== ps aux Output ===\n";
    echo $stdout;
    if ($stderr) {
        echo "=== STDERR ===\n$stderr\n";
    }
} else {
    // Try ps -ef
    $process = proc_open("ps -ef", $descriptorspec, $pipes);
    if (is_resource($process)) {
        $stdout = stream_get_contents($pipes[1]);
        fclose($pipes[1]);
        $stderr = stream_get_contents($pipes[2]);
        fclose($pipes[2]);
        proc_close($process);

        echo "=== ps -ef Output ===\n";
        echo $stdout;
    } else {
        echo "Failed to run ps aux and ps -ef\n";
    }
}
?>
