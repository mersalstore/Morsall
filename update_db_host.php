<?php
$env = '/home/u754458241/domains/morsall.com/public_html/app_new/.env';
$content = file_get_contents($env);
$newContent = str_replace('127.0.0.1', 'localhost', $content);
file_put_contents($env, $newContent);
echo "Updated DATABASE_URL to use localhost instead of 127.0.0.1";
?>
