<?php
echo "<pre>";
echo "Searching for all 'server.log' files...\n";
$output = shell_exec("find /home/u754458241 -name server.log 2>&1");
echo htmlspecialchars($output);
echo "\n--- Done ---\n";
echo "</pre>";
?>
