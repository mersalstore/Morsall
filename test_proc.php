<?php
$descriptorspec = array(
   0 => array("pipe", "r"),
   1 => array("pipe", "w"),
   2 => array("pipe", "w")
);

$process = proc_open('node -v', $descriptorspec, $pipes);

if (is_resource($process)) {
    echo "Output: " . stream_get_contents($pipes[1]);
    echo "Error: " . stream_get_contents($pipes[2]);
    fclose($pipes[0]);
    fclose($pipes[1]);
    fclose($pipes[2]);
    proc_close($process);
} else {
    echo "proc_open failed.";
}
?>
