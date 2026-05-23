import paramiko
import time

def final_master_fix():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    # Correct DB URL and engine
    db_url = 'mysql://u754458241_Kanan:4aE1b?DI|@localhost/u754458241_Kanan?connection_limit=5'
    
    # PHP Code for Admin Fix
    php_code = f"""<?php
header('Content-Type: text/plain');
$host = 'localhost';
$user = 'u754458241_Kanan';
$pass = '4aE1b?DI|';
$db   = 'u754458241_Kanan';
try {{
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $email = 'blackhatsd.sd@gmail.com';
    $new_pass = 'MersalAdmin2026';
    $hashed_pass = password_hash($new_pass, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("UPDATE User SET role = 'ADMIN', password = ? WHERE email = ?");
    $stmt->execute([$hashed_pass, $email]);
    echo "SUCCESS: Admin access restored for $email. Password: $new_pass\\n";
}} catch (Exception $e) {{ echo "Error: " . $e->getMessage(); }}
?>"""

    try:
        print("Connecting to SSH...")
        client.connect(host, port=port, username=user, password=pasw, timeout=30)
        print("Connected.")
        
        # 1. Create fix_admin.php
        remote_php = '/home/u754458241/domains/morsall.com/public_html/fix_admin.php'
        sftp = client.open_sftp()
        with sftp.file(remote_php, 'w') as f:
            f.write(php_code)
        sftp.close()
        print(f"Created {remote_php}")
        
        # 2. Update .env files
        files = [
            '/home/u754458241/nodeapp/.env',
            '/home/u754458241/nodeapp/.env.production',
            '/home/u754458241/domains/morsall.com/nodejs/.env',
            '/home/u754458241/domains/morsall.com/nodejs/.env.production'
        ]
        
        for f_path in files:
            py_cmd = f"""
import os
path = '{f_path}'
if os.path.exists(path):
    with open(path, 'r') as f: lines = f.readlines()
    with open(path, 'w') as f:
        found_db = False
        found_eng = False
        for line in lines:
            if line.startswith('DATABASE_URL='):
                f.write('DATABASE_URL="{db_url}"\\n')
                found_db = True
            elif line.startswith('PRISMA_CLIENT_ENGINE_TYPE='):
                f.write('PRISMA_CLIENT_ENGINE_TYPE=library\\n')
                found_eng = True
            else: f.write(line)
        if not found_db: f.write('DATABASE_URL="{db_url}"\\n')
        if not found_eng: f.write('PRISMA_CLIENT_ENGINE_TYPE=library\\n')
"""
            client.exec_command(f"python3 -c \\\"{py_cmd}\\\"")
            print(f"Updated {f_path}")

        # 3. Restart
        client.exec_command('mkdir -p /home/u754458241/nodeapp/tmp && touch /home/u754458241/nodeapp/tmp/restart.txt')
        print("Restarted.")
        
        client.close()
        print("Master Fix Done.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    final_master_fix()
