<?php
echo "Searching for node in /opt/alt...\n";
$output = shell_exec("find /opt/alt -name node 2>&1");
echo "<pre>$output</pre>";

echo "\nChecking /usr/local/lsws...\n";
$output2 = shell_exec("find /usr/local/lsws -name node 2>&1");
echo "<pre>$output2</pre>";
?>
