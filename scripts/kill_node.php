<?php
echo "Attempting to find process on port 3000...\n";

// Try using lsof
$output = [];
exec("lsof -i :3000 -t", $output);
if (!empty($output)) {
    foreach ($output as $pid) {
        echo "Found PID $pid on port 3000. Killing it...\n";
        exec("kill -9 $pid");
    }
} else {
    echo "lsof didn't find anything. Trying netstat...\n";
    exec("netstat -nlp | grep :3000", $output);
    print_r($output);
}

// Try to find ANY node process
echo "\nChecking for all node processes:\n";
exec("ps aux | grep node", $output);
print_r($output);
?>
