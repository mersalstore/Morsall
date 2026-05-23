<?php
// Run unzip in background and return immediately
$app_new = '/home/u754458241/domains/morsall.com/public_html/app_new';
$public  = '/home/u754458241/domains/morsall.com/public_html';
$log     = $public . '/unzip_progress.log';

echo "<pre>\n";

// Check if already done
if (is_dir("$app_new/node_modules/next")) {
    echo "✅ node_modules/next ALREADY EXISTS!\n";
    echo "✅ @prisma: " . (is_dir("$app_new/node_modules/@prisma") ? "YES" : "NO") . "\n";
    exit;
}

// Check current progress
if (file_exists($log)) {
    echo "Progress log:\n" . file_get_contents($log) . "\n";
    exit;
}

// Start background extraction
$cmd = "cd $app_new && nohup sh -c '"
     . "unzip -n $public/core_modules.zip >> $log 2>&1 && "
     . "unzip -n $public/next_at_modules.zip >> $log 2>&1 && "
     . "unzip -n $public/remaining_modules.zip >> $log 2>&1 && "
     . "echo DONE >> $log"
     . "' > /dev/null 2>&1 &";

$pid = shell_exec("$cmd echo \$!");
file_put_contents($log, "Started at: " . date('H:i:s') . "\nPID: $pid\n");

echo "✅ Extraction started in background!\n";
echo "Refresh this page in 2 minutes to check progress.\n";
echo "Log file: $log\n";
echo "</pre>\n";
?>
