<?php
/**
 * MORSALL COMPREHENSIVE FIXER
 * This script fixes DATABASE_URL, PRISMA_CLIENT_ENGINE_TYPE, and starts/restarts the Node.js app.
 */

header('Content-Type: text/plain');
echo "--- MORSALL FIXER STARTING ---\n";

$base_dir = '/home/u754458241';
$env_files = [
    "$base_dir/nodeapp/.env",
    "$base_dir/nodeapp/.env.production",
    "$base_dir/domains/morsall.com/nodejs/.env",
    "$base_dir/domains/morsall.com/nodejs/.env.production",
    "$base_dir/domains/morsall.com/public_html/app_new/.env",
    "$base_dir/domains/morsall.com/public_html/app_new/.env.production"
];

$correct_db_url = 'mysql://u754458241_Kanan:4aE1b?DI|@localhost/u754458241_Kanan?connection_limit=5';

foreach ($env_files as $file) {
    if (file_exists($file)) {
        echo "Processing $file...\n";
        $lines = file($file);
        $new_lines = [];
        $found_db = false;
        $found_engine = false;

        foreach ($lines as $line) {
            if (strpos($line, 'DATABASE_URL=') === 0) {
                $new_lines[] = "DATABASE_URL=\"$correct_db_url\"\n";
                $found_db = true;
            } else if (strpos($line, 'PRISMA_CLIENT_ENGINE_TYPE=') === 0) {
                $new_lines[] = "PRISMA_CLIENT_ENGINE_TYPE=binary\n";
                $found_engine = true;
            } else {
                $new_lines[] = $line;
            }
        }

        if (!$found_db) $new_lines[] = "DATABASE_URL=\"$correct_db_url\"\n";
        if (!$found_engine) $new_lines[] = "PRISMA_CLIENT_ENGINE_TYPE=binary\n";

        file_put_contents($file, implode('', $new_lines));
        echo "Updated $file\n";
    }
}

// Update start_morsall.js if it exists to match binary engine
$start_script = "$base_dir/nodeapp/start_morsall.js";
if (file_exists($start_script)) {
    echo "Updating start script $start_script...\n";
    $content = file_get_contents($start_script);
    $content = str_replace("process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library'", "process.env.PRISMA_CLIENT_ENGINE_TYPE = 'binary'", $content);
    file_put_contents($start_script, $content);
    echo "Updated $start_script\n";
}

// Restart
@mkdir("$base_dir/nodeapp/tmp", 0755, true);
@mkdir("$base_dir/domains/morsall.com/nodejs/tmp", 0755, true);
touch("$base_dir/nodeapp/tmp/restart.txt");
touch("$base_dir/domains/morsall.com/nodejs/tmp/restart.txt");

echo "Restart triggered.\n";
echo "--- FIX COMPLETED ---\n";
?>
