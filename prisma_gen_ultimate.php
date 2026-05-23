<?php
$descriptorspec = array(
   0 => array("pipe", "r"),
   1 => array("pipe", "w"),
   2 => array("pipe", "w")
);

$node = '/opt/alt/alt-nodejs22/root/usr/bin/node';
$prismaBin = '/home/u754458241/domains/morsall.com/public_html/app_new/node_modules/prisma/build/index.js';

// If build/index.js didn't work, let's try to find where the actual CLI is
// Most common path is node_modules/prisma/build/index.js or node_modules/prisma/prisma-client/index.js
// But let's try the .bin one with node explicitly

$prismaBin2 = '/home/u754458241/domains/morsall.com/public_html/app_new/node_modules/.bin/prisma';

$cmd = "cd /home/u754458241/domains/morsall.com/public_html/app_new && $node $prismaBin2 generate 2>&1";
echo "Running: $cmd\n";
$process = proc_open($cmd, $descriptorspec, $pipes);

if (is_resource($process)) {
    echo "<pre>";
    echo "Output:\n";
    echo htmlspecialchars(stream_get_contents($pipes[1]));
    echo "Errors:\n";
    echo htmlspecialchars(stream_get_contents($pipes[2]));
    echo "</pre>";
    fclose($pipes[0]);
    fclose($pipes[1]);
    fclose($pipes[2]);
    proc_close($process);
}
?>
