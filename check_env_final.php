<?php
$env = '/home/u754458241/domains/morsall.com/public_html/app_new/.env';
if (file_exists($env)) {
    echo "Content of .env (Sensitive info hidden):\n";
    $lines = file($env);
    foreach ($lines as $line) {
        if (strpos($line, 'DATABASE_URL') !== false) {
            // Hide password
            echo preg_replace('/:.*@/', ':****@', $line);
        } else {
            echo $line;
        }
    }
} else {
    echo ".env NOT FOUND in app_new.";
}
?>
