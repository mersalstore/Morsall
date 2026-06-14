import ftplib
import urllib.request
import ssl
import time

def run_prisma_generate():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    # 1. Read original .htaccess so we can restore it exactly
    with open("public_htaccess.txt", "r", encoding="utf-8") as f:
        original_htaccess = f.read()
        
    # 2. Define passenger-disabled .htaccess
    disabled_htaccess = """# Passenger disabled temporarily
PassengerEnabled off
"""
    
    # 3. Define temp_prisma_gen.php content
    php_code = """<?php
header('Content-Type: text/plain; charset=utf-8');
$descriptorspec = array(
   0 => array("pipe", "r"),
   1 => array("pipe", "w"),
   2 => array("pipe", "w")
);

$node = '/opt/alt/alt-nodejs20/root/usr/bin/node';
if (!file_exists($node)) {
    $node = '/opt/alt/alt-nodejs22/root/usr/bin/node';
}
if (!file_exists($node)) {
    $node = 'node';
}

$cmd = "cd /home/u754458241/domains/morsall.com/nodejs && $node ./node_modules/prisma/build/index.js generate 2>&1";
echo "Running command: $cmd\\n\\n";

$process = proc_open($cmd, $descriptorspec, $pipes);

if (is_resource($process)) {
    echo "Output:\\n";
    echo stream_get_contents($pipes[1]);
    echo "\\nErrors:\\n";
    echo stream_get_contents($pipes[2]);
    fclose($pipes[0]);
    fclose($pipes[1]);
    fclose($pipes[2]);
    proc_close($process);
} else {
    echo "proc_open failed.\\n";
}
?>"""
    
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        ftp.cwd("/public_html")
        
        # Write files locally
        with open("disabled_htaccess.txt", "w", encoding="utf-8") as f:
            f.write(disabled_htaccess)
        with open("temp_prisma_gen.php", "w", encoding="utf-8") as f:
            f.write(php_code)
            
        # Step A: Upload disabled htaccess
        print("Disabling Passenger in .htaccess...")
        with open("disabled_htaccess.txt", "rb") as f:
            ftp.storbinary("STOR .htaccess", f)
        ftp.voidcmd("SITE CHMOD 644 .htaccess")
        
        # Step B: Upload temp_prisma_gen.php
        print("Uploading temp_prisma_gen.php...")
        with open("temp_prisma_gen.php", "rb") as f:
            ftp.storbinary("STOR temp_prisma_gen.php", f)
        ftp.voidcmd("SITE CHMOD 644 temp_prisma_gen.php")
        
        # Wait a short moment for Apache to register changes
        time.sleep(2)
        
        # Step C: Request temp_prisma_gen.php via HTTP
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        
        url = "https://morsall.com/temp_prisma_gen.php"
        print(f"Requesting {url}...")
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
        )
        
        try:
            res = urllib.request.urlopen(req, context=ctx)
            response_text = res.read().decode('utf-8')
            print("\n--- PRISMA GENERATE OUTPUT ---")
            print(response_text)
            print("------------------------------\n")
        except Exception as http_err:
            print(f"HTTP Request failed: {http_err}")
            # Try to read error body if available
            if hasattr(http_err, 'read'):
                try:
                    print("Error body:", http_err.read().decode('utf-8', errors='ignore')[:1000])
                except:
                    pass
            
        # Step D: Restore original .htaccess
        print("Restoring original .htaccess...")
        with open("public_htaccess.txt", "rb") as f:
            ftp.storbinary("STOR .htaccess", f)
        ftp.voidcmd("SITE CHMOD 644 .htaccess")
        
        # Step E: Delete temp_prisma_gen.php
        print("Deleting temp_prisma_gen.php from server...")
        ftp.delete("temp_prisma_gen.php")
        
        print("Cleanup done.")
        ftp.quit()
        
    except Exception as e:
        print(f"Error during execution: {e}")

if __name__ == "__main__":
    run_prisma_generate()
