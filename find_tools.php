<?php
$descriptorspec = array(
   0 => array("pipe", "r"),
   1 => array("pipe", "w"),
   2 => array("pipe", "w")
);

$process = proc_open('find /opt/alt/alt-nodejs22 -name npm 2>&1', $descriptorspec, $pipes);

if (is_resource($process)) {
    echo "<pre>NPM search results:\n";
    echo htmlspecialchars(stream_get_contents($pipes[1]));
    echo "</pre>";
    proc_close($process);
}

$process2 = proc_open('find ./node_modules/prisma -name index.js 2>&1', $descriptorspec, $pipes);
if (is_resource($process2)) {
    echo "<pre>Prisma search results:\n";
    echo htmlspecialchars(stream_get_contents($pipes[1]));
    echo "</pre>";
    proc_close($process2);
}
?>
