<?php
// check_upload_path.php - افتحه على السيرفر مرة واحدة بس
header('Content-Type: application/json');

$paths = [
    'cwd'            => getcwd(),
    'document_root'  => $_SERVER['DOCUMENT_ROOT'] ?? 'N/A',
    'script_dir'     => __DIR__,
    
    // Possible uploads paths
    'uploads_in_doc_root'     => $_SERVER['DOCUMENT_ROOT'] . '/uploads',
    'uploads_in_cwd'          => getcwd() . '/uploads',
    'uploads_in_public_html'  => '/home/u754458241/public_html/uploads',
    'uploads_in_nodejs_public' => '/home/u754458241/domains/morsall.com/nodejs/public/uploads',
];

$result = [];
foreach ($paths as $key => $path) {
    $result[$key] = [
        'path'    => $path,
        'exists'  => file_exists($path),
        'is_dir'  => is_dir($path),
        'writable'=> is_writable($path),
        'files'   => is_dir($path) ? array_slice(scandir($path), 2, 5) : [],
    ];
}

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
