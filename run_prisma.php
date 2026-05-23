<?php
header('Content-Type: text/plain');
$cmd = "cd /home/u754458241/domains/morsall.com/public_html/app_new && PATH=/opt/alt/alt-nodejs20/root/usr/bin:/usr/local/bin:/usr/bin:/bin \$PATH /opt/alt/alt-nodejs20/root/usr/bin/npx prisma db push --skip-generate 2>&1";
echo "Running: $cmd\n\n";
passthru($cmd);
?>
