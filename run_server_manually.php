<?php
header('Content-Type: text/plain; charset=utf-8');

echo "=== Running server.js manually via Node v20 ===\n";

$node = '/opt/alt/alt-nodejs20/root/usr/bin/node';
$server_script = '/home/u754458241/domains/morsall.com/nodejs/server.js';
$cwd = '/home/u754458241/domains/morsall.com/nodejs';

echo "Node binary: $node\n";
echo "Server script: $server_script\n\n";

if (!file_exists($server_script)) {
    die("Server script does not exist!");
}

$descriptorspec = [
    0 => ["pipe", "r"], // stdin
    1 => ["pipe", "w"], // stdout
    2 => ["pipe", "w"]  // stderr
];

// Set environment variables just in case
$env = array_merge($_ENV, [
    'NODE_ENV' => 'production',
    'PORT' => '3011', // Run on a different port for manual test
    'DATABASE_URL' => 'mysql://u754458241_matger:l$9Qs3i]g0y]/V~k@127.0.0.1:3306/u754458241_matger' // let's double check if this is the DB URL or similar
]);

$process = proc_open("$node $server_script", $descriptorspec, $pipes, $cwd, $env);

if (is_resource($process)) {
    fclose($pipes[0]);

    // Set stream to non-blocking so we can read partial output
    stream_set_blocking($pipes[1], 0);
    stream_set_blocking($pipes[2], 0);

    $stdout = "";
    $stderr = "";
    
    // Run and check output for up to 3 seconds
    $start_time = time();
    while (time() - $start_time < 3) {
        $out = fread($pipes[1], 4096);
        $err = fread($pipes[2], 4096);
        if ($out !== false && $out !== "") {
            $stdout .= $out;
            echo "[STDOUT] $out";
            flush();
        }
        if ($err !== false && $err !== "") {
            $stderr .= $err;
            echo "[STDERR] $err";
            flush();
        }
        usleep(100000); // Wait 100ms
    }

    // Terminate the process
    echo "\nTerminating manual test process...\n";
    proc_terminate($process);
    
    fclose($pipes[1]);
    fclose($pipes[2]);
    proc_close($process);

    echo "\n=== Manual Run Completed ===\n";
} else {
    echo "Failed to start process\n";
}
?>
