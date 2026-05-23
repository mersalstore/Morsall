<?php
echo "Process List:\n";
$output = shell_exec("ps aux");
echo $output;
?>
