<?php
echo "<pre>";
$modules = '/home/u754458241/domains/morsall.com/nodejs/node_modules/';
$fallback = $modules . 'next/next-swc-fallback/';

$pkgs = [
    '@next/swc-linux-x64-gnu' => 'next-swc.linux-x64-gnu.node',
    '@next/swc-linux-x64-musl' => 'next-swc.linux-x64-musl.node'
];

foreach ($pkgs as $pkg => $file) {
    $pkg_dir = $modules . $pkg;
    if (!is_dir($pkg_dir)) {
        if (mkdir($pkg_dir, 0755, true)) {
            echo "✅ Created directory $pkg_dir\n";
        }
    }
    
    $src = $fallback . $file;
    $dst = $pkg_dir . '/' . $file;
    
    if (file_exists($src)) {
        if (copy($src, $dst)) {
            echo "✅ Copied $file to $pkg_dir\n";
            
            // Also need package.json in those folders!
            $pjson = json_encode([
                "name" => $pkg,
                "version" => "15.1.4",
                "os" => ["linux"],
                "cpu" => ["x64"],
                "main" => $file,
                "files" => [$file]
            ], JSON_PRETTY_PRINT);
            file_put_contents($pkg_dir . '/package.json', $pjson);
            echo "✅ Created package.json in $pkg_dir\n";
        }
    } else {
        echo "❌ Source $src NOT FOUND\n";
    }
}
echo "</pre>";
?>
