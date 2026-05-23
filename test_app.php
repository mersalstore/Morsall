<?php
echo "Testing node execution...\n";
echo shell_exec("node /home/u754458241/nodeapp/app.js 2>&1 | head -n 20");
?>
