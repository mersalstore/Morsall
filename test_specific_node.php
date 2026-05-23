<?php
$descriptorspec = array(
   0 => array("pipe", "r"),
   1 => array("pipe", "w"),
   2 => array("pipe", "w")
);

$nodePath = '/opt/alt/node22/bin/node';
echo "Testing Node path: $nodePath\n";
$process = proc_open("$nodePath -v", $descriptorspec, $pipes);

if (is_resource($process)) {
    echo "Output: " . stream_get_contents($pipes[1]);
    echo "Error: " . stream_get_contents($pipes[2]);
    fclose($pipes[0]);
    fclose($pipes[1]);
    fclose($pipes[2]);
    proc_close($process);
} else {
    echo "proc_open failed for $nodePath.\n";
    // Try node20 just in case
    $nodePath20 = '/opt/alt/node20/bin/node';
    echo "Testing Node path: $nodePath20\n";
    $process2 = proc_open("$nodePath20 -v", $descriptorspec, $pipes);
    if (is_resource($process2)) {
        echo "Output: " . stream_get_contents($pipes[1]);
        echo "Error: " . stream_get_contents($pipes[2]);
        proc_close($process2);
    }
}
?>
