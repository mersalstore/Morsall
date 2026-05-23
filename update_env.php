<?php
$env_paths = [
    '/home/u754458241/nodeapp/.env',
    '/home/u754458241/domains/morsall.com/public_html/app_new/.env'
];

foreach ($env_paths as $path) {
    if (file_exists($path)) {
        $content = file_get_contents($path);
        // Replace the password part of DATABASE_URL
        // The old password was Code_2252
        $new_content = preg_replace('/Code_2252/', 'Morsall@123', $content);
        if (file_put_contents($path, $new_content)) {
            echo "Updated $path\n";
        } else {
            echo "Failed to update $path\n";
        }
    } else {
        echo "File $path not found\n";
    }
}

// Also touch restart.txt
$restart_file = '/home/u754458241/nodeapp/tmp/restart.txt';
if (file_exists(dirname($restart_file))) {
    touch($restart_file);
    echo "Restart triggered\n";
} else {
    echo "Restart dir not found\n";
}
?>
