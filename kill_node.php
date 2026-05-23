<?php
header('Content-Type: text/plain; charset=utf-8');
echo "=== MORSALL PROCESS REAPER ===\n";

$my_uid = posix_getuid();
echo "My UID: $my_uid (User: " . posix_getpwuid($my_uid)['name'] . ")\n\n";

$killed_count = 0;

// Scan /proc filesystem natively without spawning any subprocess
$files = glob('/proc/[0-9]*');
if (!$files) {
    echo "Failed to scan /proc or no processes found.\n";
    exit;
}

foreach ($files as $proc_dir) {
    $pid = basename($proc_dir);
    
    // Check owner of the process to avoid trying to kill other users' processes
    $stat = @stat($proc_dir);
    if (!$stat || $stat['uid'] !== $my_uid) {
        continue;
    }
    
    // Read command line
    $cmdline = @file_get_contents("$proc_dir/cmdline");
    if (!$cmdline) continue;
    
    // Replace null bytes with spaces for clean printing
    $cmdline_clean = str_replace("\x00", " ", $cmdline);
    
    // Check if it's a Node or Prisma process
    $should_kill = false;
    if (stripos($cmdline_clean, 'node') !== false) {
        $should_kill = true;
    } elseif (stripos($cmdline_clean, 'query-engine') !== false) {
        $should_kill = true;
    } elseif (stripos($cmdline_clean, 'prisma') !== false) {
        $should_kill = true;
    }
    
    // Avoid killing this current PHP process
    if ($pid == posix_getpid()) {
        $should_kill = false;
    }
    
    if ($should_kill) {
        echo "Found Process [PID: $pid]: $cmdline_clean\n";
        echo "  Sending SIGKILL (9)... ";
        if (posix_kill($pid, 9)) {
            echo "SUCCESS\n";
            $killed_count++;
        } else {
            echo "FAILED\n";
        }
    }
}

echo "\nReaper complete. Total processes killed: $killed_count\n";
?>
