<?php
$descriptorspec = array(
   0 => array("pipe", "r"),
   1 => array("pipe", "w"),
   2 => array("pipe", "w")
);

$process = proc_open('find /opt/alt -name node 2>&1', $descriptorspec, $pipes);

if (is_resource($process)) {
    echo "<pre>Node search results:\n";
    echo htmlspecialchars(stream_get_contents($pipes[1]));
    echo "</pre>";
    fclose($pipes[0]);
    fclose($pipes[1]);
    fclose($pipes[2]);
    proc_close($process);
}
?>
