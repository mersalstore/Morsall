<?php
header('Content-Type: text/plain');
echo "=== KILL NODE PROCESSES ===\n";

echo "1. Checking current node processes...\n";
exec('ps aux | grep node', $output_ps);
echo implode("\n", $output_ps) . "\n\n";

echo "2. Killing node and lsnode processes...\n";
$out1 = []; $ret1 = -1;
exec('pkill -9 -u u754458241 node', $out1, $ret1);
echo "pkill node status: $ret1\n";

$out2 = []; $ret2 = -1;
exec('pkill -9 -u u754458241 lsnode', $out2, $ret2);
echo "pkill lsnode status: $ret2\n";

echo "\n3. Checking processes after kill...\n";
$output_ps_after = [];
exec('ps aux | grep node', $output_ps_after);
echo implode("\n", $output_ps_after) . "\n";
?>
