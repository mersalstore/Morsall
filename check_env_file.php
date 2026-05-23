<?php
$root = '/home/u754458241/domains/morsall.com/nodejs/';
$env_file = $root . '.env';
if (file_exists($env_file)) {
    echo ".env exists. Size: " . filesize($env_file) . " bytes\n";
    // Check if it contains DATABASE_URL
    $content = file_get_contents($env_file);
    if (strpos($content, 'DATABASE_URL') !== false) {
        echo "DATABASE_URL is present in .env\n";
    } else {
        echo "DATABASE_URL is MISSING in .env!\n";
    }
} else {
    echo ".env file NOT FOUND at $env_file\n";
    // Try to create it from hostinger_env.txt if it exists
    if (file_exists($root . 'hostinger_env.txt')) {
        copy($root . 'hostinger_env.txt', $env_file);
        chmod($env_file, 0666);
        echo "Created .env from hostinger_env.txt\n";
    }
}
?>
