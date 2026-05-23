<?php
echo "Which node: ";
passthru("which node 2>&1");
echo "\nNode -v: ";
passthru("node -v 2>&1");
echo "\nPATH: ";
passthru("echo \$PATH 2>&1");
?>
