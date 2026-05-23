<?php
echo "<pre>";
echo "Running fix_slashes_deep.php via CLI...\n";
echo shell_exec("php fix_slashes_deep.php 2>&1");
echo "\n\nChecking nodeapp structure...\n";
echo shell_exec("ls -R /home/u754458241/nodeapp/.next | head -n 50");
echo "\n\nChecking logs...\n";
echo shell_exec("tail -n 20 /home/u754458241/nodeapp/stderr.log");
echo "</pre>";
?>
