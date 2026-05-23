<?php
echo "<pre>";
echo "Node version: " . shell_exec('node -v 2>&1') . "\n";
echo "NPM version: " . shell_exec('npm -v 2>&1') . "\n";
echo "Path: " . shell_exec('echo $PATH 2>&1') . "\n";
echo "Whoami: " . shell_exec('whoami 2>&1') . "\n";
echo "</pre>";
?>
