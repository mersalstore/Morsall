<?php
$descriptorspec = array(
   0 => array("pipe", "r"),
   1 => array("pipe", "w"),
   2 => array("pipe", "w")
);

$process = proc_open('ps auxww', $descriptorspec, $pipes);

if (is_resource($process)) {
    echo "<pre>";
    echo "Processes:\n";
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
