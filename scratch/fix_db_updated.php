<?php
header('Content-Type: text/plain');
// المسار الصحيح لمجلد المشروع على Hostinger
$node_dir = '/home/u754458241/domains/morsall.com/nodejs';
$node_bin = '/opt/alt/alt-nodejs22/root/usr/bin';

if (!is_dir($node_dir)) {
    die("Error: Node directory not found at $node_dir");
}

chdir($node_dir);

// تحديث PATH ليشمل Node.js
putenv("PATH=$node_bin:" . getenv('PATH'));

echo "=== Morsall Database Fixer (Improved) ===\n";
echo "Current Directory: " . getcwd() . "\n";
echo "Node Version: " . shell_exec('node -v') . "\n";

// تنفيذ Prisma generate أولاً
echo "\n> Generating Prisma Client...\n";
$gen_output = shell_exec("node $node_bin/npx prisma generate 2>&1");
echo $gen_output;

// تنفيذ Prisma db push لتحديث الجداول
echo "\n> Pushing Database Schema...\n";
$push_output = shell_exec("node $node_bin/npx prisma db push --accept-data-loss 2>&1");
echo $push_output;

// إعادة تشغيل السيرفر (Phusion Passenger)
echo "\n> Restarting Server...\n";
if (!is_dir('tmp')) mkdir('tmp', 0755);
touch('tmp/restart.txt');

echo "\n=== ALL DONE! Try adding a product now. ===";
?>
