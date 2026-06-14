import ftplib
import io
import urllib.request
import ssl

def main():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    # Create a PHP script that creates restart.txt in a Hostinger-compatible way
    # AND checks what the current server.js actually is on disk
    php_content = '''<?php
header('Content-Type: text/plain');

$nodejs_dir = '/home/u754458241/domains/morsall.com/nodejs';

// Check what server.js looks like right now
$sjs = file_get_contents($nodejs_dir . '/server.js');
echo "server.js first 100 chars:\\n";
echo substr($sjs, 0, 100) . "\\n\\n";
echo "server.js size: " . strlen($sjs) . " bytes\\n\\n";

// Check .htaccess
$htaccess = file_get_contents($nodejs_dir . '/.htaccess');
echo ".htaccess:\\n" . $htaccess . "\\n\\n";

// Try touching the Passenger restart.txt in the correct location
// Hostinger uses /nodejs/tmp/restart.txt
$restart_paths = [
    $nodejs_dir . '/tmp/restart.txt',
    '/home/u754458241/domains/morsall.com/public_html/tmp/restart.txt',
    '/home/u754458241/tmp/restart.txt',
    '/tmp/passenger.restart.txt',
];

foreach ($restart_paths as $p) {
    $dir = dirname($p);
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    file_put_contents($p, time());
    echo "Touched: $p\\n";
}

// Also check what port is being used
$port_test = @fsockopen('127.0.0.1', 3000, $errno, $errstr, 2);
if ($port_test) {
    fclose($port_test);
    echo "\\nPort 3000: OPEN";
} else {
    echo "\\nPort 3000: CLOSED - $errstr";
}

// Also try checking socket file
$socket_paths = [
    '/home/u754458241/domains/morsall.com/nodejs/passenger.socket',
    '/home/u754458241/tmp/passenger.socket',
    '/tmp/passenger.socket',
];
foreach ($socket_paths as $s) {
    echo "\\nSocket $s: " . (file_exists($s) ? "EXISTS" : "not found");
}

echo "\\n\\nDone.";
?>
'''
    
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        print("Logged in")
        
        ftp.cwd("/public_html")
        ftp.storbinary("STOR diag_restart.php", io.BytesIO(php_content.encode()))
        print("Uploaded diag_restart.php")
        
        ftp.quit()
        
        # Call it
        print("\nCalling diag_restart.php...")
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        
        req = urllib.request.Request(
            "https://morsall.com/diag_restart.php",
            headers={"User-Agent": "Mozilla/5.0"}
        )
        with urllib.request.urlopen(req, timeout=30, context=ctx) as r:
            resp = r.read().decode("utf-8", errors="replace")
            print("Response:")
            print(resp)
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
