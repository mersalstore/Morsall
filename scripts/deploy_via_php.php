<?php
header('Content-Type: text/plain');
echo "Starting deployment script...\n";

function run($cmd) {
    echo "\n> $cmd\n";
    $output = [];
    $return_var = 0;
    exec($cmd . ' 2>&1', $output, $return_var);
    echo implode("\n", $output) . "\n";
    echo "Exit code: $return_var\n";
    return $return_var;
}

$remotePath = '/home/u754458241/domains/morsall.com/nodejs/';
chdir($remotePath);

run('unzip -o Morsall_Hostinger_Deploy.zip');
run('rm Morsall_Hostinger_Deploy.zip');
run('npm install --production');
run('npx prisma generate');
run('mkdir -p tmp && touch tmp/restart.txt');

echo "\nDone!";
?>
