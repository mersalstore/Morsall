<?php
if ($_GET['token'] !== 'mersal2026') die('Unauthorized');

if ($_FILES['file']) {
    $target = '/home/u754458241/domains/morsall.com/public_html/app_new/' . $_POST['path'];
    $dir = dirname($target);
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    
    if (move_uploaded_file($_FILES['file']['tmp_name'], $target)) {
        echo "Successfully uploaded " . $_POST['path'] . "<br>";
        // Trigger restart
        touch('/home/u754458241/nodeapp/tmp/restart.txt');
    } else {
        echo "Failed to upload " . $_POST['path'];
    }
}
?>
<form method="POST" enctype="multipart/form-data">
  Path: <input type="text" name="path" value="src/lib/auth.ts"><br>
  File: <input type="file" name="file"><br>
  <input type="submit">
</form>
