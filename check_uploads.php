<?php
header('Content-Type: text/plain');
$env = @file_get_contents('/home/u754458241/domains/morsall.com/nodejs/.env');
echo "ENV VARS:\n";
foreach(explode("\n", $env) as $line) {
    if(strpos($line, 'UPLOAD') !== false) {
        echo $line . "\n";
    }
}

echo "\n\nUPLOADS FOLDER IN NODEJS/PUBLIC:\n";
$output1 = shell_exec("ls -la /home/u754458241/domains/morsall.com/nodejs/public/uploads 2>&1");
echo $output1;

echo "\n\nUPLOADS FOLDER IN PUBLIC_HTML:\n";
$output2 = shell_exec("ls -la /home/u754458241/domains/morsall.com/public_html/uploads 2>&1");
echo $output2;
?>
