<?php
header('Content-Type: text/plain; charset=utf-8');
$envPath = '/home/u754458241/domains/morsall.com/nodejs/.env.production';

$envContent = 'DATABASE_URL="mysql://u754458241_Kanan:Code2252@127.0.0.1/u754458241_Kanan?connection_limit=1"' . "\n";
$envContent .= 'GOOGLE_CLIENT_ID="949180865508-uc3av4gfh0he5u7dqub8es9g9crgrduu.apps.googleusercontent.com"' . "\n";
$envContent .= 'GOOGLE_CLIENT_SECRET="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"' . "\n";
$envContent .= 'NEXTAUTH_URL="https://morsall.com"' . "\n";
$envContent .= 'NEXTAUTH_SECRET="MersalEliteSecret2026"' . "\n";
$envContent .= 'PRISMA_CLIENT_ENGINE_TYPE=binary' . "\n";
$envContent .= 'UPLOAD_INLINE_FALLBACK=0' . "\n";
$envContent .= 'MAX_UPLOAD_SIZE_MB=10' . "\n";

if (file_put_contents($envPath, $envContent) !== false) {
    echo "Successfully fixed .env.production with correct db password!\n";
    
    // Trigger restart
    $restartFile = '/home/u754458241/domains/morsall.com/nodejs/tmp/restart.txt';
    @touch($restartFile);
    echo "Passenger restart triggered!\n";
} else {
    echo "Failed to write .env.production\n";
}
