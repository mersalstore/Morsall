<?php
$descriptorspec = array(
   0 => array("pipe", "r"),
   1 => array("pipe", "w"),
   2 => array("pipe", "w")
);

$cmd = "cd /home/u754458241/domains/morsall.com/public_html/app_new && ./node_modules/.bin/prisma generate 2>&1";
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
} else {
    echo "proc_open failed.";
}
?>
