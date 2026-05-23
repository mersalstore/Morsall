<?php
$zip_file = "fast_update.zip";
$dest_dir = "app_new";

if (file_exists($zip_file)) {
    rename($zip_file, "$dest_dir/$zip_file");
}

exec("cd $dest_dir && unzip -o $zip_file", $output, $return_var);
if ($return_var === 0) {
    echo "Extracted $zip_file<br>";
    touch("$dest_dir/tmp/restart.txt");
    echo "Restarted Node.js<br>";
} else {
    echo "Failed to unzip. Output: <pre>" . implode("\n", $output) . "</pre>";
}

@unlink("$dest_dir/$zip_file");
?>
