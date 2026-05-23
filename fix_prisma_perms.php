<?php
$f = '/home/u754458241/domains/morsall.com/nodejs/node_modules/.prisma/client/query-engine-rhel-openssl-3.0.x';
if (file_exists($f)) {
    echo "Permissions: " . decoct(fileperms($f) & 0777) . "\n";
    chmod($f, 0755);
    echo "Updated to 0755\n";
} else {
    echo "Binary NOT FOUND at $f";
}
?>
