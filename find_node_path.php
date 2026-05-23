<?php
echo "Node Path Search:<br>";
echo "which node: " . shell_exec('which node') . "<br>";
echo "node -v: " . shell_exec('node -v') . "<br>";
echo "PATH: " . getenv('PATH') . "<br>";
echo "Common paths:<br>";
$paths = [
    '/usr/local/bin/node',
    '/usr/bin/node',
    '/opt/alt/alt-nodejs20/root/usr/bin/node',
    '/opt/alt/alt-nodejs22/root/usr/bin/node',
    '/home/u754458241/bin/node'
];
foreach ($paths as $path) {
    if (file_exists($path)) {
        echo "$path EXISTS<br>";
    } else {
        echo "$path NOT FOUND<br>";
    }
}
?>
