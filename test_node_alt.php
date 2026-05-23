<?php
$node = '/opt/alt/alt-nodejs22/root/usr/bin/node';
echo "<pre>";
echo "Testing exec():\n";
exec("$node -v 2>&1", $output, $return_var);
print_r($output);
echo "Return var: $return_var\n";

echo "\nTesting passthru():\n";
ob_start();
passthru("$node -v 2>&1");
$result = ob_get_clean();
echo $result;
echo "</pre>";
?>
