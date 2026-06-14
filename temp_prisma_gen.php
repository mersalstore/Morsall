<?php
header('Content-Type: text/plain; charset=utf-8');
$descriptorspec = array(
   0 => array("pipe", "r"),
   1 => array("pipe", "w"),
   2 => array("pipe", "w")
);

$node = '/opt/alt/alt-nodejs20/root/usr/bin/node';
if (!file_exists($node)) {
    $node = '/opt/alt/alt-nodejs22/root/usr/bin/node';
}
if (!file_exists($node)) {
    $node = 'node';
}

$cmd = "cd /home/u754458241/domains/morsall.com/nodejs && $node ./node_modules/prisma/build/index.js generate 2>&1";
echo "Running command: $cmd\n\n";

$process = proc_open($cmd, $descriptorspec, $pipes);

if (is_resource($process)) {
    echo "Output:\n";
    echo stream_get_contents($pipes[1]);
    echo "\nErrors:\n";
    echo stream_get_contents($pipes[2]);
    fclose($pipes[0]);
    fclose($pipes[1]);
    fclose($pipes[2]);
    proc_close($process);
} else {
    echo "proc_open failed.\n";
}
?>