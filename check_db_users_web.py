import ftplib
import urllib.request
import ssl

def check_users():
    host = "82.198.228.182"
    user = "u754458241.morsall.com"
    pasw = "l$9Qs3i]g0y]/V~k"
    
    php_code = """<?php
header('Content-Type: text/plain; charset=utf-8');
$host = '127.0.0.1';
$db   = 'u754458241_Kanan';
$user = 'u754458241_Kanan';
$pass = 'CODe_2222';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
     echo "Connection SUCCESS.\n\n";
     
     // 1. Show database tables
     $stmt = $pdo->query('SHOW TABLES');
     echo "Tables:\n";
     while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
         echo "- " . $row[0] . "\n";
     }
     echo "\n";
     
     // 2. Count users by role
     $stmt = $pdo->query('SELECT role, COUNT(*) as cnt FROM User GROUP BY role');
     echo "Users by Role:\n";
     while ($row = $stmt->fetch()) {
         echo "- " . $row['role'] . ": " . $row['cnt'] . "\n";
     }
     echo "\n";
     
     // 3. Show blackhatsd user
     $stmt = $pdo->prepare('SELECT id, email, name, role, password FROM User WHERE email = ?');
     $stmt->execute(['blackhatsd.sd@gmail.com']);
     $u = $stmt->fetch();
     if ($u) {
         echo sprintf("Found User - ID: %s, Email: %s, Name: %s, Role: %s, HasPassword: %d\n",
             $u['id'], $u['email'], $u['name'], $u['role'], !empty($u['password']));
     } else {
         echo "User blackhatsd.sd@gmail.com not found!\n";
     }
     echo "\n";
     
} catch (\PDOException $e) {
     echo "PDO Connection Error: " . $e->getMessage() . "\n";
}
?>"""
    
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, pasw)
        ftp.cwd("/public_html")
        
        # Upload PHP script
        with open("temp_db_check.php", "w", encoding="utf-8") as f:
            f.write(php_code)
            
        with open("temp_db_check.php", "rb") as f:
            ftp.storbinary("STOR temp_db_check.php", f)
        print("Uploaded temp_db_check.php to public_html.")
        
        # Request via HTTP
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        
        url = "https://morsall.com/temp_db_check.php"
        print(f"Requesting {url}...")
        req = urllib.request.urlopen(url, context=ctx)
        response_text = req.read().decode('utf-8')
        print("\n--- RESPONSE FROM SERVER ---")
        print(response_text)
        print("----------------------------\n")
        
        # Delete PHP script via FTP
        ftp.delete("temp_db_check.php")
        print("Deleted temp_db_check.php from server.")
        ftp.quit()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_users()
