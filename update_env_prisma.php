<?php
$env = '/home/u754458241/domains/morsall.com/public_html/app_new/.env';
$content = file_get_contents($env);
$newContent = str_replace('PRISMA_CLIENT_ENGINE_TYPE=library', 'PRISMA_CLIENT_ENGINE_TYPE=binary', $content);
file_put_contents($env, $newContent);
echo "Updated PRISMA_CLIENT_ENGINE_TYPE to binary in .env";
?>
