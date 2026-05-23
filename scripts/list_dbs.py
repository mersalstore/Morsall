import paramiko

def list_dbs():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    host = '82.198.228.182'
    port = 65002
    user = 'u754458241'
    pasw = '@n9qe3KgL'
    
    try:
        client.connect(host, port=port, username=user, password=pasw)
        
        php_code = """<?php
        $u = 'u754458241_pGWOE';
        $p = 'EPTyNREvS6';
        $db = 'u754458241_zBYOL';
        
        try {
            $conn = new PDO("mysql:host=localhost;dbname=$db", $u, $p);
            echo "--- ALL Tables in $db ---\\n";
            $stmt = $conn->query("SHOW TABLES");
            while ($row = $stmt->fetch()) {
                echo $row[0] . "\\n";
            }
        } catch (Exception $e) {
            echo "Error: " . $e->getMessage() . "\\n";
        }
        ?>"""
        
        sftp = client.open_sftp()
        sftp.file('/home/u754458241/domains/morsall.com/public_html/list_dbs_script.php', 'w').write(php_code)
        sftp.close()
        
        stdin, stdout, stderr = client.exec_command('php /home/u754458241/domains/morsall.com/public_html/list_dbs_script.php')
        print(stdout.read().decode())
        
        client.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_dbs()
