<?php
$descriptorspec = array(
   0 => array("pipe", "r"),
   1 => array("pipe", "w"),
   2 => array("pipe", "w")
);

$appRoot = '/home/u754458241/domains/morsall.com/public_html/app_new';
$process = proc_open("find $appRoot/node_modules/prisma -name index.js 2>&1", $descriptorspec, $pipes);
if (is_resource($process)) {
    echo "<pre>Prisma search results:\n";
    echo htmlspecialchars(stream_get_contents($pipes[1]));
    echo "</pre>";
    proc_close($process);
}
?>
