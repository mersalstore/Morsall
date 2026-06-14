import ftplib
import time
import urllib.request

def main():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    # Create a PHP script to run prisma db push
    db_push_php = '''<?php
header('Content-Type: text/plain');
$nodejs_dir = '/home/u754458241/domains/morsall.com/nodejs';
chdir($nodejs_dir);

// Load env from .env.production
$env_file = $nodejs_dir . '/.env.production';
if (file_exists($env_file)) {
    $env_content = file_get_contents($env_file);
    foreach (explode("\\n", $env_content) as $line) {
        $line = trim($line);
        if (!empty($line) && strpos($line, '#') !== 0 && strpos($line, '=') !== false) {
            list($key, $val) = explode('=', $line, 2);
            putenv(trim($key) . '=' . trim($val));
        }
    }
    echo "Loaded .env.production\\n";
}

// Get node path
$node_bin = trim(shell_exec('which node 2>&1'));
if (empty($node_bin)) $node_bin = '/usr/bin/node';
echo "Node: $node_bin\\n";

// Run prisma db push
$cmd = "cd {$nodejs_dir} && DATABASE_URL=\\$(grep DATABASE_URL .env.production | cut -d= -f2-) {$node_bin} ./node_modules/.bin/prisma db push --accept-data-loss 2>&1";
echo "Running: $cmd\\n\\n";
$output = shell_exec($cmd);
echo $output;

echo "\\nDone.";
?>
'''
    
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        print("Logged in to FTP")
        
        ftp.cwd("/public_html")
        
        import io
        ftp.storbinary("STOR run_db_push_now.php", io.BytesIO(db_push_php.encode()))
        print("Uploaded run_db_push_now.php")
        
        ftp.quit()
        print("\nNow calling https://morsall.com/run_db_push_now.php ...")
        
        # Call the PHP script
        try:
            req = urllib.request.Request(
                "https://morsall.com/run_db_push_now.php",
                headers={"User-Agent": "Mozilla/5.0"}
            )
            with urllib.request.urlopen(req, timeout=120) as r:
                resp = r.read().decode("utf-8", errors="replace")
                print("Response:")
                print(resp)
        except Exception as e:
            print(f"HTTP Error: {e}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
